import {Animated, FlatList, Image, Pressable, View} from 'react-native';
import React, {useRef, useState} from 'react';

import AppText from '../../components/AppText';
import {OnBoardingData} from '../../data';
import {OnBoardingItem, Paginator, Screen} from '../../components';
import {Styles} from '../../styles';
import {COLORS, IMAGES, ROUTES} from '../../constants';
import {Commons} from '../../utils';

const OnBoarding = props => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({viewableItems}) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const scrollTo = () => {
    if (currentIndex < OnBoardingData.length - 1) {
      slidesRef.current.scrollToIndex({index: currentIndex + 1});
    } else {
      Commons.reset(props.navigation, ROUTES.LOGIN);
    }
  };

  return (
    <Screen style={{backgroundColor: COLORS.white}}>
      <FlatList
        data={OnBoardingData}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        renderItem={({item}) => (
          <OnBoardingItem item={item} data={OnBoardingData} scrollX={scrollX} />
        )}
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: false,
          },
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      <View style={Styles.slidesFooter}>
        <Pressable
          onPress={() => {
            Commons.reset(props.navigation, ROUTES.LOGIN);
          }}>
          <AppText children={'SKIP ALL'} style={Styles.skipAll} />
        </Pressable>
        <Paginator data={OnBoardingData} scrollX={scrollX} />
        <Pressable
          onPress={() => {
            scrollTo();
          }}>
          <Image source={IMAGES.arrowRight} style={Styles.slideNext} />
        </Pressable>
      </View>
    </Screen>
  );
};

export default OnBoarding;
