import React, {useState, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
// import {Camera, useCameraDevices} from 'react-native-vision-camera';
import * as mime from 'react-native-mime-types';
import {useDispatch} from 'react-redux';

import {postApiCall} from '../../services/ApiServices';
import {Icon, Screen} from '../../components';
import {Commons} from '../../utils';
import {Styles} from '../../styles';
import {COLORS} from '../../constants';

function TakePic(props) {
  const dispatch = useDispatch();
  const camera = useRef(null);

  const [flash, setFlash] = useState('off');
  const [file, setFile] = useState({});
  const [mediaUri, setMediaUri] = useState(null);

  //   const devices = useCameraDevices();
  //   const device = devices.back;
  //   const supportsFlash = device?.hasFlash ?? false;

  // const onFlashPressed = () => {
  //   setFlash(flash === 'on' ? 'off' : 'on');
  // };

  // const takePic = async () => {
  //   try {
  //     const photo = await camera.current.takePhoto({
  //       flash: flash,
  //     });
  //     let obj = {
  //       uri:
  //         Platform.OS === 'ios'
  //           ? photo.path.replace('file://', '')
  //           : 'file://' + photo.path,
  //       type: mime.lookup(photo.path),
  //       name: photo.path.replace(/^.*[\\\/]/, ''),
  //     };
  //     setFile(obj);
  //     setMediaUri(obj.uri);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  //   const renderPic = () => {
  //     return (
  //       <Screen>
  //         <Image source={{uri: mediaUri}} style={Styles.capturePrevImg} />
  //         <View style={Styles.takePicControlsViewCont}>
  //           <View style={Styles.takePicControlsView}>
  //             <Icon
  //               iconType={'material'}
  //               icon="loop"
  //               iconSize={40}
  //               iconColor={COLORS.white}
  //               onClick={() => {
  //                 setMediaUri(null);
  //               }}
  //             />
  //             <Icon
  //               iconType={'materialCommunity'}
  //               icon="check-circle-outline"
  //               iconSize={40}
  //               iconColor={COLORS.white}
  //               onClick={() => {
  //                 setMediaUri(null);
  //               }}
  //             />
  //           </View>
  //         </View>
  //       </Screen>
  //     );
  //   };

  //   if (device == null) {
  //     return (
  //       <Screen style={Styles.camNullCase}>
  //         <ActivityIndicator size={20} color={'red'} />
  //       </Screen>
  //     );
  //   }

  return (
    <Screen style={Styles.camOnCase}>
      {/* {mediaUri ? (
        renderPic()
      ) : (
        <>
          {device != null && (
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              photo={true}
            />
          )}
        </>
      )}
      {mediaUri == null && (
        <>
          <Icon
            iconType={'materialCommunity'}
            icon="arrow-left-thick"
            iconSize={30}
            iconColor={COLORS.white}
            iconBtnStyle={Styles.backBtn}
            onClick={() => {
              props.navigation.goBack();
            }}
          />
          {supportsFlash && (
            <Icon
              iconType={'ionicon'}
              icon={flash === 'on' ? 'flash' : 'flash-off'}
              iconSize={26}
              iconColor={COLORS.white}
              iconBtnStyle={Styles.flashBtn}
              onClick={() => {
                onFlashPressed();
              }}
            />
          )}
          <View style={Styles.captureBtnMainCont}>
            <View style={Styles.captureBtnCont}>
              <Pressable
                style={Styles.captureBtnView}
                onPress={() => {
                  takePic();
                }}
              />
            </View>
          </View>
        </>
      )} */}
    </Screen>
  );
}

export default TakePic;
