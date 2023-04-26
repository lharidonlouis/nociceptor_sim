import { useState, useRef, useEffect, Fragment } from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import { Stage, Layer, Circle, Rect, Arc, Text, Line } from "react-konva";
import Chart from "chart.js/auto";

function App() {
  const [distValues, setDistValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [stageDimensions, setStageDimensions] = useState({ width: 500, height: 500 });

  // IR values from the simulation
  const [irValues, setIrValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  const prevDataRef = useRef([...irValues]);

  const prevTimestampRef = useRef();

  const colors = ["#000080", "#0000FF", "#0080FF", "#00BFFF", "#87CEFA", "#B0C4DE", "#F0F8FF", "#ADD8E6"];
  const max_dist = 125
  const angle_vue = 1.1*Math.PI ;
  const IR_DISTANCE = max_dist;

  // tearing values computed from IR sensor values
  const [tearingValues, setTearingValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  // speed values computed from IR sensor values
  const [speedValues, setSpeedValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  // Nociceptor values computed from IR sensor values
  const [nociceptorValues, setNociceptorValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);


  // Konva stage and square position
  const stageRef = useRef(null);
  const [squarePos, setSquarePos] = useState({ x: 50, y: 50 });


  const distChartRef = useRef(null);

  // Chart.js IR graph
  const irChartRef = useRef(null);

  // Chart.js tearing graph
  const tearingChartRef = useRef(null);
  // Chart.js speed graph
  const speedChartRef = useRef(null);


  // Chart.js nociceptor graph
  const nociceptorChartRef = useRef(null);


  const handleResize = () => {
    const container = document.getElementById('stage-container');
    setStageDimensions({
      width: container.offsetWidth,
      height: container.offsetHeight
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Update IR values and chart when simulation sends new values
  const handleDistValues = (values) => {
    setDistValues(values);
  };


  // Update IR values and chart when simulation sends new values
  const handleIrValues = (values) => {
    setIrValues(values);
  };

   const handleNociValues = (values) => {
    setNociceptorValues(values);
  };

  useEffect(() => {
    if (irChartRef.current) {
      const chart = irChartRef.current;
      if (!chart.chart) {
        chart.chart = new Chart(chart, {
          type: "line",
          data: {
            labels: ["IR0", "IR1", "IR2", "IR3", "IR4", "IR5", "IR6", "IR7"],
            datasets: [
              {
                label: "IR Values",
                data: irValues,
                fill: false,
                borderColor: "rgb(58, 89, 152)",
                tension: 0.1,
              },
              {
                label: "Dist Values",
                data: distValues,
                fill: false,
                borderColor: "rgb(173, 216, 230)",
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
              },
            },
          },
        });
      } else {
        chart.chart.data.datasets[0].data = irValues;
        chart.chart.data.datasets[1].data = distValues;
        chart.chart.update();
      }
    }
  }, [distValues, irValues]);


  useEffect(() => {
    if (tearingChartRef.current) {
      const chart = tearingChartRef.current;

      if (!chart.chart) {
        chart.chart = new Chart(chart, {
          type: "line",
          data: {
            labels: ["N0", "N1", "N2", "N3", "N4", "N5", "N6", "N7"],
            datasets: [
              {
                label: "Tearing Values",
                data: tearingValues,
                fill: false,
                borderColor: "rgb(129, 199, 132)",
                tension: 0.1,
              },
              {
                label: "Speed Values",
                data: speedValues,
                fill: false,
                borderColor: "rgb(255, 152, 0)",
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
              },
            },
          },
        });
      } else {
        chart.chart.data.datasets[0].data = tearingValues;
        chart.chart.data.datasets[1].data = speedValues;
        chart.chart.update();
      }
    }
  }, [tearingValues, speedValues]);


  useEffect(() => {
    if (nociceptorChartRef.current) {
      const chart = nociceptorChartRef.current;

      if (!chart.chart) {
        chart.chart = new Chart(chart, {
          type: "line",
          data: {
            labels: ["N0", "N1", "N2", "N3", "N4", "N5", "N6", "N7"],
            datasets: [
              {
                label: "Nociceptor Values",
                data: nociceptorValues,
                fill: false,
                borderColor: "rgb(244, 67, 54)",
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 1,
              },
            },
          },
        });
      } else {
        chart.chart.data.labels = ["N0", "N1", "N2", "N3", "N4", "N5", "N6", "N7"]; // Updated labels here
        chart.chart.data.datasets[0].data = nociceptorValues;
        chart.chart.update();
      }
    }
  }, [nociceptorValues]);


    const handlePointerMove = (event) => {
      const stage = event.target.getStage();
      const pointerPos = stage.getPointerPosition();
      const touchPos = event.touches && event.touches[0];
      setSquarePos({
        x: touchPos ? touchPos.clientX : pointerPos.x,
        y: touchPos ? touchPos.clientY : pointerPos.y,
      });
    };
    
  // Move square with arrow keys
  const handleKeyDown = (event) => {
    switch (event.code) {
      case "ArrowUp":
        setSquarePos((prevPos) => ({ ...prevPos, y: prevPos.y - 5 }));
        break;
      case "ArrowDown":
        setSquarePos((prevPos) => ({ ...prevPos, y: prevPos.y + 5 }));
        break;
      case "ArrowLeft":
        setSquarePos((prevPos) => ({ ...prevPos, x: prevPos.x - 5 }));
        break;
      case "ArrowRight":
        setSquarePos((prevPos) => ({ ...prevPos, x: prevPos.x + 5 }));
        break;
      default:
        break;
    }
  };
  

  useEffect(() => {
    // Focus window to capture arrow key events
    window.focus();
    window.addEventListener("keydown", handleKeyDown);

    // Remove event listener when component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const prevData = prevDataRef.current; // Use the current value of prevDataRef
    
    const prevTimestamp = prevTimestampRef.current;
    const currentTimestamp = Date.now();
    const timeDiff = currentTimestamp - prevTimestamp;

    const update = () => {

      const speed = computeSpeedValue();
      const tear= computeTearingValue();
      const noci= computeNociceptorValue(tear,speed);


      setSpeedValues(speed);
      setTearingValues(tear);

      const noci_post_g = computeGaussian(noci);


      setNociceptorValues(noci_post_g);


      prevDataRef.current = [...irValues];
      prevTimestampRef.current = currentTimestamp;
    }

    const computeTearingValue = () => {
      const tearing_d = [];
      const tresh = 0.1;
      const contiguousSensors = [[0, 7], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]];
    
      for (let i = 0; i < 8; i++) {
        const prevDist = prevData[i];
        const currDist = irValues[i];
        const [prevContig, currContig] = contiguousSensors[i];
    
        if (prevDist < 1 && currDist < 1) {
          const prevContigDist = prevData[prevContig];
          const currContigDist = irValues[currContig];
    
          const prevContigDiff = Math.abs(currDist - prevContigDist);
          const currContigDiff = Math.abs(currDist - currContigDist);
    
          if (prevContigDiff < tresh * prevContigDist || currContigDiff < tresh * currDist) {
            const tearingValue = Math.abs(currDist - Math.min(prevContigDist, currContigDist)) / tresh;
            tearing_d[i] = tearingValue > 1 ? 1 : tearingValue;
          } else {
            tearing_d[i] = 0;
          }
        } else {
          tearing_d[i] = 0;
        }
      }
    
      console.log("tearing", tearing_d);
      return tearing_d;
    };
            
    const computeSpeedValue = () => {
        const speed_d = [];
        // Compute the speed impact for each IR sensor
        for (let i = 0; i < irValues.length; i++) {
          const dist = -(prevData[i] - irValues[i]);
          const dist_0 = dist < 0 ? 0 : dist;
          
          console.log(timeDiff)
          const speed_per_s = (dist_0 / (timeDiff*0.0001)); // ms speed

          speed_d[i] = speed_per_s > 1 ? 1 : speed_per_s;
        }
        console.log("speed", speed_d);
        return speed_d;
    };

    const computeNociceptorValue = (tear, speed) => {
      const noci = [];
      // Compute the final nociceptor value for each IR sensor
      for (let i = 0; i < irValues.length; i++) {
        const nociValue = 0.5*(tear[i] + speed[i]);
        noci[i] = nociValue;
      }
      console.log("noci", noci);
      return noci;
    };

    const computeGaussian = (values) => {
      const array = Array.from({ length: values.length }, () => Array.from({ length: values.length }, () => 0));
      const noci = [];
    
      for (let center = 0; center < values.length; center++) {
        const GAUSSIAN_STD = 1;
        for (let i = 0; i < values.length; i++) {
          const distance = Math.abs(center - i);
          const gaussian = Math.exp(-(distance ** 2) / (2 * (GAUSSIAN_STD ** 2)));
          array[center][i] = gaussian * values[center];
        }
      }
      for (let i = 0; i < values.length; i++) {
        let sum = 0;
        for (let j = 0; j < values.length; j++) {
          sum += array[j][i];
        }
        noci[i] = sum > 1 ? 1 : sum;
      }
      
    
      console.log("noci_G", noci);
    
      return noci;
    };
    


    update();
  }, [irValues]);
  

  
  // useEffect(() => {
  //   // Calculate distance between circle border and each of the 8 IR sensors
  //   const distances = [];
    
  //   const kheperaPos = { x: 250, y: 250 };
  //   const irSensorPositions = [];

  //   for (let i = 0; i < 8; i++) {
  //     const angle = (i * 360) / 8;
  //     const sensorPos = {
  //       x: kheperaPos.x + Math.cos((angle * Math.PI) / 180) * 50,
  //       y: kheperaPos.y + Math.sin((angle * Math.PI) / 180) * 50,
  //     };
  //     irSensorPositions.push(sensorPos);
  
  //     const dx = sensorPos.x - squarePos.x;
  //     const dy = sensorPos.y - squarePos.y;

  //     var distance = Math.sqrt(dx * dx + dy * dy)-25; // subtract the radius of the circle
  //     distance = distance > (max_dist-25) ? 1 : distance / (max_dist-25) ;      
  //     distance = distance < 0 ? 0 : distance;
  //     distances[i] =distance;

  //   }
  //   console.log("distances", distances);
  
  //   setDistValues(distances);
  // }, [squarePos]);


  
  useEffect(() => {
    const distances = [];
    const is_within = [];     
  
    const kheperaPos = { x: 250, y: 250 };
    const irSensorPositions = [];
  
    for (let i = 0; i < 8; i++) {
      const angle = (i * 360) / 8;
      const sensorPos = {
        x: kheperaPos.x + Math.cos((angle * Math.PI) / 180) * 50,
        y: kheperaPos.y + Math.sin((angle * Math.PI) / 180) * 50,
      };
      irSensorPositions.push(sensorPos);
  
      // compute angle between object and sensor position
      const dx = squarePos.x - sensorPos.x;
      const dy = squarePos.y - sensorPos.y;
      const angleToObject = Math.atan2(dy, dx);
  
      // compute angle between sensor position and robot orientation
      const angleToSensor = angle - 90;
  
      // compute difference between the two angles
      let angleDiff = angleToObject - (angleToSensor * Math.PI) / 180;
      if (angleDiff < -Math.PI) {
        angleDiff += 2 * Math.PI;
      }
      if (angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
      }
  
      // check if object is within view angle
      const isWithinAngle = Math.abs(angleDiff) < angle_vue / 2;
      const num = i-1 < 0 ? 7 : i-1;
      is_within[num] = isWithinAngle;
          
      // compute distance
      var distance = Math.sqrt(dx * dx + dy * dy) - 25; // subtract the radius of the circle
      distance = distance > (max_dist - 25) ? 1 : distance / (max_dist - 25);      
      distance = distance < 0 ? 0 : distance;  

      distances[i]=distance;      
    }
    console.log("distances", distances);

    for (let i = 0; i < 8; i++) {
      if(is_within[i]){
        distances[i] = distances[i];
      }
      else{
        distances[i] = 1;
      }
    }
  
    console.log("is_within", is_within);
    console.log("distances", distances);
    
    setDistValues(distances);
  }, [squarePos]);
  



  useEffect(() => {
    const ir = [];
    for(let i = 0; i < 8; i++){
      // var tmp = 1 - distValues[i];
      // ir[i] = tmp;

      var tmp = 0;

      if (distValues[i] < 0.2){
        tmp = 1 - (-0.5 * distValues[i] + 1);
      }
      else if (distValues[i] >= 1){
        tmp = 1;
      }
      else{
        tmp = 1- (1 / (5 * distValues[i])) - 0.1;
      }
      ir[i] = tmp;
    }

    //invert ir values =
    for (let i = 0; i < 8; i++) {
      ir[i] = 1 - ir[i];
    }
    console.log("ir", ir);
    setIrValues(ir);
  }, [squarePos]);

  return (
    <div className="App">
      <div className="container-fluid">
        <Navbar expand='lg' bg="light" variant="light">
          <div className="container-fluid">
            <Navbar.Brand href="#home">Khepera IV</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">XXXX</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </div>
        </Navbar>
      </div>
      <div className="container">
        <Row className="my-5">
          <Col md={12}>
            <h1>Khepera IV</h1>
            <p>
              Khepera IV is a small mobile robot designed and manufactured by
              K-Team Corporation. It is a differential drive robot with 2 wheels
              and 8 IR sensors. The robot is simulated in the center of the
              arena, move the mouse to simulate an object around khepera.
            </p>
          </Col>
        </Row>
        <Row className="my-5">
          <Col md={6}>
          <h2>Arena</h2>          
          <div id="stage-container" style={{ width: '100%', height: '500px' }}>
          <Stage width={stageDimensions.width} height={stageDimensions.height} onPointerMove={handlePointerMove}>
            <Layer>
              <Rect x={0} y={0} width={stageDimensions.width} height={stageDimensions.height} fill="rgba(255, 0, 0, 0.025)" />
              <Circle x={250} y={250} radius={50} fill="#EEE" />
              <Circle
                x={squarePos.x}
                y={squarePos.y}
                radius={25}
                fill="#333"
              />
              {[...Array(8)].map((_, i) => {
                const numIRs = 8;
                const angle = (i * 2 * Math.PI / numIRs) - angle_vue / 2;
                const sensorPos = {
                  x: 250 + Math.cos(angle) * 50,
                  y: 250 + Math.sin(angle) * 50,
                };
                const baseDistance = IR_DISTANCE * Math.tan(angle_vue / 2);
                const basePos1 = {
                  x: sensorPos.x + Math.cos(angle - angle_vue / 2) * baseDistance,
                  y: sensorPos.y + Math.sin(angle - angle_vue / 2) * baseDistance,
                };
                const basePos2 = {
                  x: sensorPos.x + Math.cos(angle + angle_vue / 2) * baseDistance,
                  y: sensorPos.y + Math.sin(angle + angle_vue / 2) * baseDistance,
                };
                const trianglePoints = [
                  sensorPos.x,
                  sensorPos.y,
                  basePos1.x,
                  basePos1.y,
                  basePos2.x,
                  basePos2.y,
                ];

                const n_ir_arcs = 7;
                const color = `hsl(${240+(i * 10)}, 100%, 50%)`;

                
                if(i == 0){
                  var num = 6;
                }
                else if (i == 1){
                  var num = 7;
                }
                else if (i == 8){
                  var num = 0;
                }
                else{
                  var num = i-2;
                }

                

                return (
                  <Fragment key={i}>
                    <Circle x={sensorPos.x} y={sensorPos.y} radius={5} fill={color} />
                    <Text x={sensorPos.x - 5} y={sensorPos.y - 15} text={`IR${num}`} />
                    {[...Array(n_ir_arcs)].map((_, j) => {
                      const distance = IR_DISTANCE / n_ir_arcs * (j + 1);
                      const opacity = 0.25 - j * (0.25 / n_ir_arcs);
                      return (
                        <Arc
                          x={sensorPos.x}
                          y={sensorPos.y}
                          innerRadius={distance - 1}
                          outerRadius={distance + 1}
                          angle={angle_vue * 180 / Math.PI}
                          rotation={(angle - angle_vue / 2) * 180 / Math.PI}
                          stroke={color}
                          fill={color}
                          opacity={opacity}
                      />
                      );
                    })}
                  </Fragment>
                );
              })}
            </Layer>
          </Stage>
          </div>
          </Col>
          <Col md={2}></Col>
          <Col md={4}>
            <Row>
              <Col md={12}>
                <h2>Graphs</h2>
              </Col>
              <Col md={12}>
                <canvas ref={irChartRef}></canvas>
              </Col>
              <Col md={12}>
                <canvas ref={tearingChartRef}></canvas>
              </Col>
              <Col md={12}>
                <canvas ref={nociceptorChartRef}></canvas>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
