import React, { useRef, useState } from "react";
import { FC } from "react";
import {
  View,
  Modal,
  StyleProp,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import Orientation from "react-native-orientation";
//@ts-ignore
import VideoPlayer from "react-native-video-controls";

type CFVideoProps = {
  videoUri: string;
  cfStyle: StyleProp<any>;
  poster: string;
  onEnd: any;
  canContinue?: boolean; // 切换全屏是否继续播放, 默认fasle
};

var nowTime = 0;
const CFVideoPlayer: FC<CFVideoProps> = (props) => {
  const { videoUri, cfStyle, poster, onEnd, canContinue = false } = props;
  // 全屏标识
  const [fullFlag, setFullFlag] = useState(false);
  // 控制全屏按钮的显示与隐藏，因为自带不符合要求
  const [fullControl, setFullControl] = useState(true);
  const [overlayFullControl, setOverlayFullControl] = useState(true);

  // 控制播放状态
  const [playFlag, setPlayFlag] = useState(true);
  const [overlayPlayFlag, setOverlayPlayFlag] = useState(true);

  const myOverlayVideo = useRef<VideoPlayer>();
  const myVideo = useRef<VideoPlayer>();

  // 进入全屏
  const enterFull = () => {
    Orientation.lockToLandscapeLeft();
    setFullFlag(true);

    if (canContinue) {
      setOverlayPlayFlag(playFlag);
    }
    setPlayFlag(true);
  };
  // 退出全屏
  const exitFull = () => {
    Orientation.lockToPortrait();
    setFullFlag(false);
    if (myVideo.current) {
      const temp = myVideo.current;
      temp.player.ref.seek(nowTime);

      if (canContinue) {
        setPlayFlag(overlayPlayFlag);
      } else {
        if (Platform.OS === "android") {
          temp.player.ref.setNativeProps({ seek: nowTime });
          setTimeout(() => {
            setPlayFlag(false);
            setTimeout(() => {
              setPlayFlag(true);
            }, 30);
          }, 10);
        }
      }
    }
  };

  const setPlayTime = (e: { currentTime: any }) => {
    let time = e.currentTime; // 获取播放视频的秒数
    nowTime = time;
  };

  return (
    <View
      onTouchStart={() => {
        // TODO
      }}
      onTouchEnd={() => {
        // TODO
      }}
    >
      {fullControl ? (
        <TouchableWithoutFeedback
          onPress={() => enterFull()}
          style={{ marginRight: 5 }}
        >
          <View style={styles.expandIcon}>
            <Image source={require("./assets/expand.png")} />
          </View>
        </TouchableWithoutFeedback>
      ) : null}
      <VideoPlayer
        ref={myVideo}
        source={{ uri: videoUri }}
        paused={playFlag}
        style={[cfStyle]}
        poster={poster}
        onEnd={onEnd}
        disableFullscreen={true}
        onHideControls={() => {
          setFullControl(false);
        }}
        onShowControls={() => {
          setFullControl(true);
        }}
        onPause={() => {
          setPlayFlag(true);
        }}
        onPlay={() => {
          setPlayFlag(false);
        }}
        resizeMode={"contain"}
        disableBack={true}
        disableVolume={true}
        toggleResizeModeOnFullscreen={false}
        onProgress={(e: { currentTime: any }) => setPlayTime(e)}
      />
      <Modal visible={fullFlag} supportedOrientations={["landscape-right"]}>
        {overlayFullControl ? (
          <TouchableWithoutFeedback onPress={() => exitFull()}>
            <View style={styles.shrinkIcon}>
              <Image source={require("./assets/shrink.png")} />
            </View>
          </TouchableWithoutFeedback>
        ) : null}
        <VideoPlayer
          ref={myOverlayVideo}
          source={{ uri: videoUri }}
          paused={overlayPlayFlag}
          style={[cfStyle]}
          poster={poster}
          onLoad={() => {
            if (myOverlayVideo.current) {
              const temp = myOverlayVideo.current;
              // seek方法 在安卓上无效，特殊处理
              if (Platform.OS === "android") {
                temp.player.ref.setNativeProps({ seek: nowTime });
                if (!canContinue) {
                  setTimeout(() => {
                    setOverlayPlayFlag(false);
                    setTimeout(() => {
                      setOverlayPlayFlag(true);
                    }, 30);
                  }, 10);
                }
              } else {
                temp.player.ref.seek(nowTime);
              }
            }
          }}
          onPause={() => {
            setOverlayPlayFlag(true);
          }}
          onPlay={() => {
            setOverlayPlayFlag(false);
          }}
          disableFullscreen={true}
          onHideControls={() => {
            setOverlayFullControl(false);
          }}
          onShowControls={() => {
            setOverlayFullControl(true);
          }}
          onProgress={(e: { currentTime: any }) => setPlayTime(e)}
          onEnd={() => {
            onEnd;
            Orientation.lockToPortrait();
            setFullFlag(false);
          }}
          resizeMode={"contain"}
          disableBack={true}
          disableVolume={true}
          toggleResizeModeOnFullscreen={false}
        />
      </Modal>
    </View>
  );
};

export default CFVideoPlayer;

const styles = StyleSheet.create({
  expandIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    zIndex: 999,
    marginTop: 20,
    alignSelf: "flex-end",
  },
  shrinkIcon: {
    width: 40,
    height: 40,
    position: "absolute",
    zIndex: 999,
    marginTop: 20,
    alignSelf: "flex-end",
  },
});
