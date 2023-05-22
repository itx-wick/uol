import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Keyboard,
  Pressable,
  TextInput,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RichEditor} from 'react-native-pell-rich-editor';
import {useDispatch, useSelector} from 'react-redux';
// import {Camera, useCameraDevices} from 'react-native-vision-camera';
import * as mime from 'react-native-mime-types';
import {check, PERMISSIONS} from 'react-native-permissions';
import {
  AppButton,
  AppText,
  CheckBox,
  ErrorMessage,
  Header,
  Icon,
  Loader,
  MultiSelectDD,
  Screen,
} from '../../components';
import {COLORS, END_POINT, IMAGES, ROUTES} from '../../constants';
import {Styles} from '../../styles';
import {postApiCall, postFileApiCall} from '../../services/ApiServices';
import {Commons} from '../../utils';
import {logout} from '../../redux/auth/authSlice';
import {setLoader} from '../../redux/common/commonSlice';
import {validateInput} from '../../utils/Validation';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {PERMISSION_TYPE, Permission} from '../../utils/AppPermission';

function CreateNotifications(props) {
  const dispatch = useDispatch();
  const loader = useSelector(state => state.Common.loader);
  const user = useSelector(state => state.User.currentUser);
  const userType = useSelector(state => state.Common.userType);
  const [title, setTitle] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [link, setLink] = useState('');
  const [titleErr, setTitleErr] = useState('');
  const [linkTitleErr, setLinkTitleErr] = useState('');
  const [linkErr, setLinkErr] = useState('');
  const [subjectID, setSubjectID] = useState('');
  const [subjectErr, setSubjectErr] = useState('');
  const [article, setArticle] = useState('');
  const [imagePicker, setImagePicker] = useState();

  const [sendAs, setSendAs] = useState('1');
  const [sendTo, setSendTo] = useState('1');
  const [cameraOn, setCameraOn] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [titleErrorV, setTitleErrorV] = useState(false);
  const [linkTitleErrorV, setLinkTitleErrorV] = useState(false);
  const [linkErrorV, setLinkErrorV] = useState(false);
  const [modalLinkVisible, setModalLinkVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectErrorV, setSubjectErrorV] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const RichText = React.useRef(); //reference to the RichEditor component
  const camera = React.useRef(null);
  const [file, setFile] = useState({});
  const [mediaUri, setMediaUri] = useState(null);

  const data_ = {
    id: props.loginUserId,
    image: `data:${imagePicker?.mime};base64,${imagePicker?.data}`,
  };

  const getImageCamera = () => {
    // ImagePicker.openCamera({
    //   width: 300,
    //   height: 400,
    //   cropping: true,
    //   includeBase64: true,
    // }).then(async e => {
    //   setImagePicker(e);
    // });
  };

  const takeProfilePicture = async () => {
    check(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(result => {
      if (result != 'granted') {
        Commons.reqCamraPermissions();
      } else if (result === 'granted') {
        getImageCamera();
      }
    });
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      getSubjects();
    });
    return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
    let selected = subjects.filter(item => item.isSelected);
    if (selected.length === 0) {
      setSubjectID('');
      setSelectedSubject(null);
      setData([]);
      setFilteredData([]);
    } else {
      setSubjectID(selected.map(s => s.id));
      getStudents(selected.map(s => s.id));
    }
  }, [subjects]);

  const onTitleChange = data => {
    setTitle(data);
    setTitleErr('');
    setTitleErrorV(false);
  };

  const onLinkTitleChange = data => {
    setLinkTitle(data);
    setLinkTitleErr('');
    setLinkTitleErrorV(false);
  };

  const onLinkChange = data => {
    setLink(data);
    setLinkErr('');
    setLinkErrorV(false);
  };

  function onSelectSubject() {
    return obj => {
      handleSubjectSelect(obj.id);
      setSelectedSubject(obj.item);
      setSubjectErr('');
      setSubjectErrorV(false);
    };
  }

  const handleSubjectSelect = id => {
    let temp = subjects.map(val => {
      if (id === val.id) {
        return {...val, isSelected: !val.isSelected};
      }
      return val;
    });
    setSubjects(temp);
  };

  const handleSelectAllStudents = () => {
    if (filteredData.length !== 0) {
      setSelectAll(!selectAll);
      let temp = filteredData.map(val => {
        return {...val, isSelected: !selectAll};
      });
      setData(temp);
      setFilteredData(temp);
    }
  };

  const getSubjects = () => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
    };
    postApiCall(END_POINT.GET_KEYWORD_TEMPLATES, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            setSubjects(Commons.notificationSubArray(res.Data.Subjects));
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        console.warn(err);
        dispatch(setLoader(false));
      });
  };

  const getStudents = id => {
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      SubjectID: id,
    };
    postApiCall(END_POINT.GET_STUDENTS_SUBJECTS, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.danger);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            const stdRes = res.Data.Students;
            for (var i = 0; i < stdRes.length; i++) {
              let arr = stdRes;
              arr.forEach(object => {
                object.isSelected = false;
              });
              const key = 'ID';
              const unique = [
                ...new Map(arr.map(item => [item[key], item])).values(),
              ];
              setData(unique);
              setFilteredData(unique);
            }
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        console.warn(err);
        dispatch(setLoader(false));
      });
  };

  const DataNotFound = () => {
    return (
      <View style={{flex: 1}}>
        <Image source={IMAGES.noData} style={Styles.noDataImg4} />
      </View>
    );
  };

  const renderItem = ({item, index}) => {
    return (
      <Pressable
        onPress={() => {
          isSelectedItem(index, item);
        }}>
        <View style={Styles.t_exam_detail_student_list_card}>
          <View style={{width: '15%'}}>
            <>
              {item.ProfilePic && item.ProfilePic !== '' ? (
                <Image
                  source={{uri: item.ProfilePic}}
                  style={Styles.studentImage}
                />
              ) : (
                <View style={Styles.stdInitials}>
                  <AppText
                    style={Styles.stdInitialsText}
                    children={Commons.getInitials(
                      item.FirstName + ' ' + item.LastName,
                    )}
                  />
                </View>
              )}
            </>
          </View>
          <View style={{width: '70%', paddingLeft: RFValue(10)}}>
            <View style={{flexDirection: 'row'}}>
              <AppText
                children={
                  item.FirstName != undefined ||
                  item.FirstName != null ||
                  item.FirstName != ''
                    ? item.FirstName + ' '
                    : ''
                }
                numberOfLines={1}
                style={{fontWeight: 'bold'}}
              />
              <AppText
                children={
                  item.LastName !== undefined ||
                  item.LastName !== null ||
                  item.LastName !== ''
                    ? item.LastName
                    : ''
                }
                numberOfLines={1}
                style={{fontWeight: 'bold', fontSize: RFValue(16)}}
              />
            </View>
            <AppText
              children={'Roll No: ' + item.RollNo}
              numberOfLines={1}
              style={{fontSize: RFValue(12)}}
            />
          </View>
          <View style={{width: '15%', alignItems: 'flex-end'}}>
            <MaterialCommunityIcon
              name={
                item.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'
              }
              size={26}
              color={COLORS.primary}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  const isSelectedItem = (index, value) => {
    const fData = [...filteredData];
    fData[index].isSelected = value.isSelected === false ? true : false;
    setFilteredData(fData);
    setData(fData);
  };

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  const onSubmit = () => {
    hideKeyboard();
    if (!validateInput(title).status) {
      setTitleErrorV(true);
      setTitleErr(validateInput(title, 'Please enter title').error);
      return;
    }
    if (!validateInput(subjectID).status) {
      setSubjectErrorV(true);
      setSubjectErr(validateInput(subjectID, 'Please select subject').error);
      return;
    }
    let selected = filteredData.filter(item => item.isSelected);
    let studentIDs = selected.map(s => s.ID);
    dispatch(setLoader(true));
    let params = {
      ID: user.ID,
      APIAccessToken: user.APIAccessToken,
      Type: userType,
      Title: title,
      Description: article,
      SendAs: sendAs,
      SendTo: sendTo,
      students: studentIDs,
      subjects: subjectID,
      schedule: 0,
      data_1: '',
    };
    postApiCall(END_POINT.CREATE_NOTIFICATION, params)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length !== 0) {
            Commons.snackBar(res.Message, COLORS.green);
            clearFields();
            props.navigation.goBack();
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        console.warn(err);
        dispatch(setLoader(false));
      });
  };

  const onAddLink = () => {
    hideKeyboard();
    if (!validateInput(linkTitle).status) {
      setLinkTitleErrorV(true);
      setLinkTitleErr(validateInput(linkTitle, 'Please enter title').error);
      return;
    }
    if (!validateInput(link).status) {
      setLinkErrorV(true);
      setLinkErr(validateInput(link, 'Please enter link').error);
      return;
    }
    addLink(linkTitle, link);
    setLinkTitle('');
    setLink('');
    setModalLinkVisible(!modalLinkVisible);
  };

  const clearFields = () => {
    setTitle('');
    setArticle('');
    setSelectedSubject('');
    setSubjectID('');
    setSubjects([]);
    setSubjects([]);
    setData([]);
    setSelectAll(false);
    setFilteredData([]);
  };

  function removeExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  }

  const uploadFile = fileData => {
    dispatch(setLoader(true));
    postFileApiCall(END_POINT.UPLOAD_ATTACHMENT, fileData)
      .then(res => {
        if (res.Code === 2) {
          Commons.snackBar(res.Message, COLORS.primary);
          dispatch(logout());
          Commons.reset(props.navigation, ROUTES.LOGIN);
        } else if (res.Code === 1) {
          if (Object.keys(res.Data).length === 0) {
            Commons.snackBar(res.Message, COLORS.green);
          } else {
            let filename = removeExtension(res.Data.upload_response.name);
            let path = res.Data.upload_response.path;
            let type = Commons.isImage(path.toLowerCase());
            if (type) {
              insertImage(filename, path);
            } else {
              addLink(filename, path);
            }
          }
        } else if (res.Code === 0) {
          Commons.snackBar(res.Message, COLORS.primary);
        }
        dispatch(setLoader(false));
      })
      .catch(err => {
        dispatch(setLoader(false));
      });
  };

  const pickImage = async () => {
    await Commons.pickSingleFile()
      .then(result => {
        const entry = {
          name: result.name,
          type: result.type,
          uri: result.uri,
          size: result.size,
          path: result.fileCopyUri,
        };
        if (entry.size > 30000000) {
          Commons.snackBar('Max file size should be 30 MB');
        } else {
          var bodyFormData = new FormData();
          bodyFormData.append('ID', user.ID);
          bodyFormData.append('APIAccessToken', user.APIAccessToken);
          bodyFormData.append('Type', userType);
          bodyFormData.append('file', {
            uri: entry.path,
            type: entry.type,
            name: entry.name,
          });
          uploadFile(bodyFormData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  function insertImage(title, url) {
    // you can easily add images from your gallery
    RichText.current?.insertHTML(`<br><img src="${url}" alt="${title}" /><br>`);
  }

  function addLink(name, url) {
    // you can easily add videos from your gallery
    RichText.current?.insertLink(name, url);
  }

  let renderModal = () => {
    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <Pressable
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={styles.centeredView}>
          <View style={Styles.attachmentModalView}>
            <AppText children={'Attach'} style={Styles.attachmentModalTitle} />
            <Pressable
              onPress={() => {
                hideKeyboard();
                pickImage();
              }}
              style={Styles.attachmentModalItemRow}>
              <MaterialCommunityIcon
                name={'file-upload'}
                size={30}
                color={COLORS.primary}
              />
              <AppText
                children={'File'}
                style={Styles.attachmentModalItemRowText}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setModalVisible(!modalVisible);
                setModalLinkVisible(!modalLinkVisible);
              }}
              style={Styles.attachmentModalItemRow}>
              <MaterialCommunityIcon
                name={'link-box'}
                size={30}
                color={COLORS.primary}
              />
              <AppText
                children={'Link'}
                style={Styles.attachmentModalItemRowText}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                // const granted = Permission.requestPermission(
                //   PERMISSION_TYPE.camera,
                // );
                // if (granted) {
                //   setCameraOn(true);
                // }
                takeProfilePicture();
                setModalVisible(!modalVisible);
              }}
              style={Styles.attachmentModalItemRow}>
              <MaterialCommunityIcon
                name={'camera'}
                size={30}
                color={COLORS.primary}
              />
              <AppText
                children={'Use Camera'}
                style={Styles.attachmentModalItemRowText}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    );
  };

  let renderLinkModal = () => {
    return (
      <Modal
        transparent={true}
        visible={modalLinkVisible}
        onRequestClose={() => {
          setModalLinkVisible(!modalLinkVisible);
        }}>
        <Pressable
          onPress={() => {
            setModalLinkVisible(!modalLinkVisible);
          }}
          style={styles.centeredView}>
          <View style={Styles.attachLinkModalView}>
            <AppText
              children={'Add Link'}
              style={Styles.attachLinkModalTitle}
            />
            <View style={Styles.attachLinkSecCont}>
              <View style={{width: '90%'}}>
                <TextInput
                  name="linkTitle"
                  keyboardType="default"
                  returnKeyType="next"
                  placeholder="Enter Title"
                  value={linkTitle}
                  onChangeText={onLinkTitleChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.addLinkInputField}
                />
                {linkTitleErrorV && <ErrorMessage message={linkTitleErr} />}
              </View>
              <View style={{width: '90%'}}>
                <TextInput
                  name="link"
                  keyboardType="default"
                  returnKeyType="next"
                  placeholder="Enter Link"
                  value={link}
                  onChangeText={onLinkChange}
                  placeholderTextColor={COLORS.gray}
                  style={Styles.addLinkInputField}
                />
                {linkErrorV && <ErrorMessage message={linkErr} />}
              </View>
              <View style={Styles.addLinkBtnRow}>
                <AppButton
                  title="Cancel"
                  btnStyle={Styles.addLinkCancelBtn}
                  titleStyle={Styles.addLinkBtnTxt}
                  onPress={() => {
                    setModalLinkVisible(!modalLinkVisible);
                  }}
                />
                <AppButton
                  title="Add"
                  btnStyle={Styles.addLinkBtn}
                  titleStyle={Styles.addLinkBtnTxt}
                  onPress={onAddLink}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

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

  const renderPic = () => {
    return (
      <Screen>
        <Image source={{uri: mediaUri}} style={Styles.capturePrevImg} />
        <View style={Styles.takePicControlsViewCont}>
          <View style={Styles.takePicControlsView}>
            <Icon
              iconType={'material'}
              icon="loop"
              iconSize={40}
              iconColor={COLORS.white}
              onClick={() => {
                setMediaUri(null);
              }}
            />
            <Icon
              iconType={'materialCommunity'}
              icon="check-circle-outline"
              iconSize={40}
              iconColor={COLORS.white}
              onClick={() => {
                setCameraOn(false);
                setMediaUri(null);
                var bodyFormData = new FormData();
                bodyFormData.append('ID', user.ID);
                bodyFormData.append('APIAccessToken', user.APIAccessToken);
                bodyFormData.append('Type', userType);
                bodyFormData.append('file', {
                  uri: file.uri,
                  type: file.type,
                  name: file.name,
                });
                uploadFile(bodyFormData);
              }}
            />
          </View>
        </View>
      </Screen>
    );
  };

  // if (device == null && cameraOn) {
  //   return (
  //     <Screen style={Styles.camNullCase}>
  //       <ActivityIndicator size={20} color={'red'} />
  //     </Screen>
  //   );
  // }

  return (
    <>
      {/* {cameraOn ? (
        <Screen style={Styles.camOnCase}>
          {mediaUri ? (
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
                  setMediaUri(null);
                  setCameraOn(false);
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
          )}
        </Screen>
      ) : ( */}
      <Screen>
        <Header
          navigation={props.navigation}
          title={'Add Notification'}
          showBackButton={true}
          showDrawerBtn={false}
          showRightBtn={true}
          showAttachmentBtn={true}
          onBackPress={() => {
            props.navigation.goBack();
            clearFields();
          }}
          onAttachmentBtnPress={() => {
            setModalVisible(!modalVisible);
          }}
          onRightBtnPress={onSubmit}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => RichText.current?.dismissKeyboard()}>
            <View style={Styles.createNotificationMainCont}>
              <View style={Styles.createNotificationCont}>
                <AppText children={'Send As'} style={{color: COLORS.primary}} />
                <View style={Styles.notificationSendTypeCont}>
                  <CheckBox
                    onPress={() => {
                      setSendAs('1');
                    }}
                    title={'Notification'}
                    isChecked={sendAs === '1' ? true : false}
                    checkBoxSize={26}
                    checkBoxColor={COLORS.primary}
                    checkBoxLabelColor={COLORS.black}
                    labelTextStyle={{
                      marginLeft: RFValue(5),
                      marginTop: RFValue(1),
                    }}
                    viewDirection={{
                      flexDirection: 'row',
                      marginHorizontal: RFValue(5),
                    }}
                  />
                  <CheckBox
                    onPress={() => {
                      setSendAs('2');
                    }}
                    title={'Email'}
                    isChecked={sendAs === '2' ? true : false}
                    checkBoxSize={24}
                    checkBoxColor={COLORS.primary}
                    checkBoxLabelColor={COLORS.black}
                    labelTextStyle={{
                      marginLeft: RFValue(5),
                      marginTop: RFValue(1),
                    }}
                    viewDirection={{
                      flexDirection: 'row',
                      marginHorizontal: RFValue(5),
                    }}
                  />
                  <CheckBox
                    onPress={() => {
                      setSendAs('3');
                    }}
                    title={'Both'}
                    isChecked={sendAs === '3' ? true : false}
                    checkBoxSize={26}
                    checkBoxColor={COLORS.primary}
                    checkBoxLabelColor={COLORS.black}
                    labelTextStyle={{
                      marginLeft: RFValue(5),
                      marginTop: RFValue(1),
                    }}
                    viewDirection={{
                      flexDirection: 'row',
                      marginHorizontal: RFValue(5),
                    }}
                  />
                </View>
                <View
                  style={{
                    marginTop: RFValue(5),
                  }}>
                  <TextInput
                    name="title"
                    keyboardType="default"
                    returnKeyType="next"
                    placeholder="Enter Title"
                    value={title}
                    onChangeText={onTitleChange}
                    placeholderTextColor={COLORS.gray}
                    style={Styles.createNotificationInputField}
                  />
                  {titleErrorV && <ErrorMessage message={titleErr} />}
                  <View style={Styles.createNotificationDescInputField}>
                    <RichEditor
                      disabled={false}
                      style={{
                        padding: 0,
                      }}
                      useContainer={false}
                      androidHardwareAccelerationDisabled={true}
                      containerStyle={{minHeight: RFValue(100)}}
                      onChange={text => setArticle(text)}
                      returnKeyType="done"
                      ref={RichText}
                      placeholder={'Write your message here...'}
                    />
                  </View>
                  <View style={{marginTop: RFValue(10)}}>
                    <MultiSelectDD
                      data={subjects}
                      label="Select Subjects"
                      onSelect={onSelectSubject()}
                    />
                  </View>
                  {subjectErrorV && <ErrorMessage message={subjectErr} />}
                </View>
                <View style={Styles.sendToMainCont}>
                  <AppText
                    children={'Send As'}
                    style={{color: COLORS.primary}}
                  />
                  <View style={Styles.notificationSendTypeCont}>
                    <CheckBox
                      onPress={() => {
                        setSendTo('1');
                      }}
                      title={'Students'}
                      isChecked={sendTo === '1' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.primary}
                      checkBoxLabelColor={COLORS.black}
                      labelTextStyle={{
                        marginLeft: RFValue(5),
                        marginTop: RFValue(1),
                      }}
                      viewDirection={{
                        flexDirection: 'row',
                        marginHorizontal: RFValue(5),
                      }}
                    />
                    <CheckBox
                      onPress={() => {
                        setSendTo('2');
                      }}
                      title={'Parents'}
                      isChecked={sendTo === '2' ? true : false}
                      checkBoxSize={24}
                      checkBoxColor={COLORS.primary}
                      checkBoxLabelColor={COLORS.black}
                      labelTextStyle={{
                        marginLeft: RFValue(5),
                        marginTop: RFValue(1),
                      }}
                      viewDirection={{
                        flexDirection: 'row',
                        marginHorizontal: RFValue(5),
                      }}
                    />
                    <CheckBox
                      onPress={() => {
                        setSendTo('3');
                      }}
                      title={'Both'}
                      isChecked={sendTo === '3' ? true : false}
                      checkBoxSize={26}
                      checkBoxColor={COLORS.primary}
                      checkBoxLabelColor={COLORS.black}
                      labelTextStyle={{
                        marginLeft: RFValue(5),
                        marginTop: RFValue(1),
                      }}
                      viewDirection={{
                        flexDirection: 'row',
                        marginHorizontal: RFValue(5),
                      }}
                    />
                  </View>
                </View>
                {filteredData.length !== 0 && (
                  <Pressable
                    onPress={handleSelectAllStudents}
                    style={Styles.selectAllView}>
                    <AppText
                      children={'Select All Students'}
                      style={{color: COLORS.primary}}
                    />
                    <MaterialCommunityIcon
                      name={
                        selectAll ? 'checkbox-marked' : 'checkbox-blank-outline'
                      }
                      size={26}
                      color={COLORS.primary}
                    />
                  </Pressable>
                )}
              </View>
              <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={DataNotFound}
                style={Styles.announcement_list}
                contentContainerStyle={Styles.notificationlistContentContainer}
              />
            </View>
          </Pressable>
        </ScrollView>
        {renderModal()}
        {renderLinkModal()}
      </Screen>
      {/* )} */}

      {loader ? <Loader /> : null}
    </>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default CreateNotifications;
