import { mouse, left, right, up, down, Button, Point, screen, Region} from '@nut-tree/nut-js'; 
import { WebSocketServer } from 'ws';
import Jimp from 'jimp';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    const dataStr= data.toString().replace('_',' ');
    const [command, property, ...args] = dataStr.split(' ');
    if (command === 'prnt') {
      (async () => {const position:Point = await mouse.getPosition();  
    const screenRegion =  new Region(position.x - 100, position.y - 100, 200, 200); 
    const screenShot = await screen.grabRegion(screenRegion);
    const pngScreen = new Jimp(screenShot);
    if (pngScreen) {
      const pngBuffer = await pngScreen.getBufferAsync(Jimp.MIME_PNG);
      //const pngBuffer = await pngScreen.getBase64Async(Jimp.MIME_PNG);
      console.log(`prnt_scrn ${pngBuffer}`);
      ws.send (`prnt_scrn ${pngBuffer}`);
    }
    /* async (err:Error, image:any) => {
      console.log(image);
      if (image) {
      const pngBufer = await image.getBase64Async( image.Jimp.MIME_PNG);
      console.log(`prnt_scrn ${pngBufer }`);
      ws.send (`prnt_scrn ${pngBufer }`);
      }  
      console.log(err);
    }); */
    /* Jimp.read(screenShot.data)
  .then(image => {
    console.log(`prnt_scrn ${image }`);
    ws.send (`prnt_scrn ${image }`);
  })
  .catch(err => {
    console.log(err);
  }); */
    
  }
)();
    }
    
    if (command === 'mouse') {
        (async () => {
          switch (property) {
            case 'up' : await mouse.move(up(+args[0]));
                        break;
            case 'left' : await mouse.move(left(+args[0]));
                          break;
            case 'right' : await mouse.move(right(+args[0]));
                         break; 
            case 'down' : await mouse.move(down(+args[0]));
                         break;
            case 'position': {
                              const position:Point = await mouse.getPosition(); 
                              console.log(`mouse_position ${position.x},${position.y}`);
                              ws.send(`mouse_position ${position.x},${position.y}`);
                              break;
                              }                                                     
            default: ws.send('wrong_data');
           }
      })();
    }
    if (command === 'draw') {
      (async () => {
        switch (property) {
          case 'circle' : {
                      const circlePoints:Point[] = [];
                      const position:Point = await mouse.getPosition();
                      const r = +args[0];
                      const maxPoints = (r) * 2;
                      const firstPoint = new Point(position.x - r, position.y);
                      circlePoints.push(firstPoint);
                      await mouse.move(circlePoints);
                      circlePoints.pop();
                      for (let i=0; i < maxPoints ; i++) {
                        const x = - r + i;
                        const y = Math.round(Math.sqrt(r * r - x * x));
                        const point = new Point(position.x + x, position.y - y);
                        circlePoints.push(point);
                      }
                    for (let i=maxPoints - 1; i>=0; i--) {
                        const x = - r + i;
                        const y = Math.round(Math.sqrt(r * r - x * x));
                        const point = new Point(position.x + x, position.y + y);
                        circlePoints.push(point);
                      } 
                      await mouse.pressButton(Button.LEFT); 
                      await mouse.move(circlePoints);
                      await mouse.releaseButton(Button.LEFT);
                    }
                      break;
          case 'rectangle' :                       await mouse.pressButton(Button.LEFT); 
          await mouse.move(left(+args[0]));
          await mouse.move(down(+args[1]));
          await mouse.move(right(+args[0]));
          await mouse.move(up(+args[1]));
          await mouse.releaseButton(Button.LEFT);
                        break;
          case 'square' :                       await mouse.pressButton(Button.LEFT); 
          await mouse.move(left(+args[0]));
          await mouse.move(down(+args[0]));
          await mouse.move(right(+args[0]));
          await mouse.move(up(+args[0]));
          await mouse.releaseButton(Button.LEFT);
                       break;                                       
          default: ws.send('wrong_data');
         }
    }
    
    )();
    }
  });
  ws.send('connected');
});