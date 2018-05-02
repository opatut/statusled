#include <Adafruit_NeoPixel.h>

#define VCC_PIN 15
#define GND_PIN 16
#define LED_PIN 17
#define LED_COUNT 6

enum State {
  Off = 0,
  Red = 1,
  Yellow = 2,
  Green = 3,
  Blue = 4,
  Party = 5,
  Police = 6,
  Random = 7,

  __count = 8,
};

Adafruit_NeoPixel leds = Adafruit_NeoPixel(LED_COUNT, LED_PIN, NEO_RGB + NEO_KHZ400);

State state = State::Off;

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
    state = (State)(Serial.read() % State::__count);
  }

  int color;
  
  switch (state) {
    case State::Off:
      color = 0x000000;
      break;
      
    case State::Red:
      color = 0xFF0000;
      break;
      
    case State::Yellow:
      color = 0xDDDD00;
      break;
    
    case State::Green:
      color = 0x00FF00;
      break;
      
    case State::Blue:
      color = 0x0000FF;
      break;

    case State::Party:
      color = hueLightness((millis() / 20) % 255, 1);
      break;

    case State::Police:
      color = police();
      break;
    
    case State::Random:
      color = random(0, 0xFFFFFF);
      break;
  }

  leds.setPixelColor(0, color);
  leds.show();
  
  delay(50);
}

uint32_t police() {
  int c = millis() / 40 % 20;
  return (c % 2) * (c % 10 >=8 ? 0xFFFFFF : c < 10 ? 0xFF0000 : 0x0000FF);
}

uint32_t hueLightness(byte h, float b) {
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

