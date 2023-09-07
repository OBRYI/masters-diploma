//import ketai.*;

KetaiCamera cam;

float MIN_R = 1.0;
float MAX_R = 360.0;
int NUM_STEPS = 360;

PGraphics maskedCam;
PGraphics mask;

Button cameraSwitch;
Button cameraChanger;
Button cameraFlashToggle;

void setup() {
  fullScreen(P2D);//720 x 1555
  orientation(PORTRAIT);
  cam = new KetaiCamera(this, 1280, 720, 30);
  imageMode(CENTER);
  initPGraphics();
  cameraSwitch = new Button(width/2-120, height-240, 240, 120);
  cameraChanger = new Button(0, height-240, 240, 120);
  cameraFlashToggle = new Button(width/2+120, height-240, 240, 120);
}

void draw() {
  if (cam.isStarted())
  {
    maskedCam.beginDraw();
    maskedCam.push();
    maskedCam.translate(cam.height/2, MAX_R);
    maskedCam.rotate(PI/2);
    maskedCam.image(cam, 0, 0);
    maskedCam.pop();
    maskedCam.image(mask, maskedCam.width/2, MAX_R);
    maskedCam.endDraw();
    image(maskedCam, maskedCam.width/2, maskedCam.height/2);
    translate(0, maskedCam.height);
    beginShape(TRIANGLE_STRIP);
    noStroke();
    texture(maskedCam);
    for (int i=0; i<NUM_STEPS; i++) {
      float angle = radians(i*360.0/(NUM_STEPS+0.0));
      float x = map(i, 0, NUM_STEPS-1, 0, width);
      vertex(x, 0, MIN_R*cos(angle)+maskedCam.width/2, MIN_R*sin(angle)+maskedCam.height/2);
      vertex(x, MAX_R, MAX_R*cos(angle)+maskedCam.width/2, MAX_R*sin(angle)+maskedCam.height/2);
    }
    endShape();
  }
  cameraSwitch.display();
  cameraChanger.display();
  cameraFlashToggle.display();
}

void onCameraPreviewEvent() {                                 // 4
  cam.read();
}

void mousePressed() {
  if (cameraSwitch.isPressed(mouseX, mouseY)) {
    if (cam.isStarted())
    {
      cam.stop();                                               // 6
    } else
    {
      cam.start();
      println(cam.dump());
      cam.autoSettings();
    }
  }
  else if (cameraChanger.isPressed(mouseX, mouseY)) {
    int camID = cam.getCameraID();
    if (camID>1) {
      cam.setCameraID(0);
    } else {
      cam.setCameraID(camID+1);
    }
  }
  else if (cameraFlashToggle.isPressed(mouseX,mouseY)){
    cam.focus();
    //if(cam.isFlashEnabled()){
    //  cam.disableFlash();
    //}
    //else{
    //  cam.enableFlash();
    //}
  }
}

void initPGraphics() {
  maskedCam = createGraphics(cam.height, floor(MAX_R*2+2), P2D);
  maskedCam.imageMode(CENTER);
  mask = createGraphics(floor(MAX_R*2+2), floor(MAX_R*2+2), P2D);
  mask.beginDraw();
  mask.translate(mask.width/2, mask.height/2);
  drawMaskShape();
  mask.endDraw();
}

void drawMaskShape() {
  mask.beginShape();

  mask.noStroke();

  mask.vertex(-mask.width/2-10, -mask.height/2-10);
  mask.vertex(mask.width/2+10, -mask.height/2-10);
  mask.vertex(mask.width/2+10, mask.height/2+10);
  mask.vertex(-mask.width/2-10, mask.height/2+10);

  mask.beginContour();

  for (int i=NUM_STEPS; i>0; i--) {
    float angle = radians(i*360.0/(NUM_STEPS+0.0));
    mask.vertex(MAX_R*cos(angle), MAX_R*sin(angle));
  }

  mask.endContour();

  mask.endShape(CLOSE);
}
