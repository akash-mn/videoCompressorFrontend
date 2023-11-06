import FileUpload from "./VideoComp/FileUpload";
import SignIn from './login/SignIn';
import SignUp from "./login/SignUp";
import { Route, Routes } from "react-router-dom";
function App() {

  return (
    <Routes>
      <Route exact path="/" element={<SignIn />} />
      <Route exact path="/register" element={<SignUp />} />
      <Route exact path="/video_compressor" element={<FileUpload />} />
    </Routes>
     
  );
}

export default App;
