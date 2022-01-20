import React, { useState, useCallback, useRef, useEffect } from "react";
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function generateDownload(canvas, crop) {
  if (!crop || !canvas) {
    return;
  }

  canvas.toBlob(
    (blob) => {
      const previewUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.download = 'sample.png';
      anchor.href = URL.createObjectURL(blob);
      anchor.click();

      window.URL.revokeObjectURL(previewUrl);
    },
    'image/png',
    1
  );
}


const App = () => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [open, setOpen] = useState(false);


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


  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

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
  }, [completedCrop]);


  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };


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
      <canvas
        ref={previewCanvasRef}
        style={{
          width: Math.round(completedCrop?.width ?? 0),
          height: Math.round(completedCrop?.height ?? 0)
        }}
      />
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
            disabled={!completedCrop?.width || !completedCrop?.height}
            onClick={() => {
              generateDownload(previewCanvasRef.current, completedCrop)
              setOpen(false);
            }
            }
          >
            完了
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

export default App;
