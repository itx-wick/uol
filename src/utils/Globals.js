import {Dimensions} from 'react-native';

class Globals {
  static screenHeight;
  static screenWidth;

  static mTop;

  static setResolution(height, width) {
    Globals.screenHeight = height;
    Globals.screenWidth = width;

    Globals.mTop = height * 0.025;
  }
}

export default Globals;
