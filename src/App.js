import React, { useState, useCallback, useRef } from "react";
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const App = () => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [open, setOpen] = useState(false);

  const generateImg = () => {
    if (!completedCrop) return;
    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    const newImg = canvas.toDataURL('image/png', 1);
    setUpImg(newImg);
  }


  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);


  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  const expansion = () => {
    const rate = 1.1;
    imgRef.current.width *= rate;
    imgRef.current.height *= rate;
  }
  const shrink = () => {
    const rate = 0.9;
    imgRef.current.width *= rate;
    imgRef.current.height *= rate;
  }

  return (
    <div>
      <Button
        variant="contained"
        component="label"
        onClick={toggleDrawer(true)}
      >
        画像挿入
        <input type="file" accept="image/*" onChange={onSelectFile} hidden />
      </Button>
      <img src={upImg} alt="アップロードされた画像" width={300} height={300}/>
      <Drawer anchor={"top"} open={open} onClose={toggleDrawer(false)}>
        <div>
          <ReactCrop
            src={upImg}
            onImageLoaded={onLoad}
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          />
          <Button
            width={100}
            variant="contained"
            disabled={!upImg}
            component="label"
            onClick={expansion}
          >
            拡大
          </Button>
          <Button
            width={100}
            variant="contained"
            disabled={!upImg}
            component="label"
            onClick={shrink}
          >
            縮小
          </Button>
          <Button
            width={100}
            variant="contained"
            disabled={!completedCrop?.width || !completedCrop?.height}
            onClick={() => {
              generateImg();
              setOpen(false);
            }}
          >
            完了
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export default App;
