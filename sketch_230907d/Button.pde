class Button {
  int x, y, w, h;
  Button(int x, int y, int w, int h) {
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
  }

  void display() {
    push();
    rect(x, y, w, h);
    pop();
  }
  boolean isPressed(int x, int y) {
    return (x>this.x&&x<this.x+w&&y>this.y&&y<this.y+h);
  }
}
