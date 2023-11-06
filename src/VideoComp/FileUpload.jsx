// src/components/FileUpload.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { styled } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CompressIcon from "@mui/icons-material/Compress";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState("");
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BASE_URL}`);

    socket.on("progress", (data) => {
      setProgress(data.progress);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setDownloadLink("");
    setName("");
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("video", selectedFile);

      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/compress`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setDownloadLink(result.downloadLink);
        setName(result.name);
        setProgress(null);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.error("No file selected");
    }
  };

  const downloadButton = async () => {
    if (downloadLink) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}${downloadLink}`, {
          method: "GET",
        });
        if (response.status === 200) {
          const fileName = name;
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.style.display = "none";

          document.body.appendChild(a);
          a.click();

          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          console.error("Failed to download the file");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.error("No download link available");
    }
  };

  return (
    <Box>
      <Box>
        <Stack direction="column">
          <Stack
            direction="row"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Button
                component="label"
                variant="contained"
                onChange={handleFileChange}
                startIcon={<CloudUploadIcon />}
              >
                Upload video {""}
                <VisuallyHiddenInput type="file" accept="video/*" />
                {selectedFile && selectedFile.name}
              </Button>
            </Box>
            <Box>
              {downloadLink ? (
                <>
                  <Button
                    variant="contained"
                    onClick={downloadButton}
                    endIcon={<DownloadForOfflineRoundedIcon />}
                  >
                    Download
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={handleFileUpload}
                    endIcon={<CompressIcon />}
                  >
                    compress video
                  </Button>
                </>
              )}
            </Box>
          </Stack>
          <Stack mt={3}>
            <Box sx={{ flexGrow: 1 }}>
              {progress && (
                <>
                  <BorderLinearProgress
                    variant="determinate"
                    value={progress}
                  />
                </>
              )}
            </Box>
          </Stack>
        </Stack>

        {/* <input type="file" accept="video/*"  /> */}
        {/* {downloadLink ? (
        <div>
          <button onClick={downloadButton}>Download Compressed Video</button>
        </div>
      ) : (
        <div>
          {progress ? (
            <>
              <div>
                <div
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "blue",
                    height: "30px",
                  }}
                >
                  {progress}%
                </div>
              </div>
            </>
          ) : (
            <>
              <button onClick={handleFileUpload}>Upload and Compress</button>
            </>
          )}
        </div>
      )} */}
      </Box>
    </Box>
  );
};

export default FileUpload;
