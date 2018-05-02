#include <Adafruit_NeoPixel.h>

#define VCC_PIN 15
#define GND_PIN 16
#define LED_PIN 17
#define LED_COUNT 6

Adafruit_NeoPixel leds = Adafruit_NeoPixel(LED_COUNT, LED_PIN, NEO_RGB + NEO_KHZ400);

char buffer[255];
int colorIndex = 2;
const int colorCount = 7;
int colors[] = {0, 0xFF0000, 0xDDDD00, 0x00FF00};

void setup() {
  Serial.begin(9600);  

  pinMode(VCC_PIN, OUTPUT);
  pinMode(GND_PIN, OUTPUT);
  digitalWrite(VCC_PIN, 1);
  digitalWrite(GND_PIN, 0);
  
  leds.begin();
}


void loop() {
  while (Serial.available()) {
    colorIndex = Serial.read() % colorCount;
  }

  int color, c;
  
  switch (colorIndex) {
    case 0:
    case 1:
    case 2:
    case 3:
      color = colors[colorIndex];
      break;

    case 4:
      color = HL((millis() / 20) % 255, 1);
      break;

    case 5:
      c = millis() / 40 % 20;
      color = (c % 2) * (c % 10 >=8 ? 0xFFFFFF : c < 10 ? 0xFF0000 : 0x0000FF);
      break;
    
    case 6:
      color = random(0, 0xFFFFFF);
      break;
  }

  leds.setPixelColor(0, color);
  leds.show();
  
  delay(50);
}

uint32_t HL(byte h, float b) {
  h = 255 - h;
  if(h < 85) {
    return leds.Color((255 - h * 3) * b, 0, h * 3 * b);
  } else if(h < 170) {
    h -= 85;
    return leds.Color(0, h * 3 * b, (255 - h * 3) * b);
  } else {
    h -= 170;
    return leds.Color(h * 3 * b, (255 - h * 3) * b, 0);
  }
}

