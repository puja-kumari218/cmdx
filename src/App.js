import Router from "./Router";
import NavigationBar from "./containers/NavigationBar";
import SvgSprite from "./utils/SvgSpriteLoader";
import svgFile from "./assets/images/svg/svg-sprite.svg";
import SideBar from "./containers/SideBar";
import { message } from 'antd';
import "./App.scss";
import 'react-loading-skeleton/dist/skeleton.css'

message.config({
  maxCount: 2,
});

const App = () => {
  return (
    <>
      <SvgSprite url={svgFile} />
      <div className="main_wrapper">
        <SideBar />
        <div className="main-container">
          <NavigationBar />
          <Router />
        </div>
      </div>
    </>
  );
}

export default App;
