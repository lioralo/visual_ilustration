var x = [];
var y = [];
var t = 0;
var data = [{
  x: x,
  y: y,
  type: 'scatter'
}];
var layout = {
  showlegend: false,
  displayModeBar: false,
  scrollZoom: false,
  editable: false,
  title: 'Population Distribution',
  xaxis: {
    fixedrange: true,
    title: 'Value',
    range: [-10, 10]
  },
  yaxis: {
    fixedrange: true,
    title: 'Probiblilty'
  }};
var options = {
  dragmode: false,
  displayModeBar: false,
};
var layout2 = {
  displayModeBar: false,
  scrollZoom: false,
  editable: false,
  title: 'confidence Intervals',
  xaxis: {
    fixedrange: true,
    title: 'Value',
    range: [-10, 10]
  },
  yaxis: {
    fixedrange: true,
    title: ''
  },
legend: {
    x: 0,
    y: 0
  }};
Plotly.newPlot('myPlot', data, layout,options);
Plotly.newPlot('myPlot2', data, layout2);

function linspace(a, b, n) {
  if (typeof n === 'undefined') n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,ret = Array(n);
  n--;
  for (i = n;i >= 0;i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}
const speedSlider = document.getElementById("speedSlider");
const speedReadout = document.getElementById("speedReadout");
const plot = document.getElementById("myPlot");
const plot2 = document.getElementById("myPlot2");
function addCI(xNew,yNew,ucl,maxy,trendNum) {
const color = trendNum === 0 ? 'rgb(255,30,30)' : 'rgb(30,30,255)';
const newData = {
    x: [].concat([ucl,ucl]),
    y: [].concat([0,maxy]),
    type: 'scatter',
    mode: 'lines',
    opacity: 1,
    line: {
      width: 3,
      color: color
    },
    showlegend: false
  };
  
  var plotData = plot.data || [];
  plotData.push(newData);
  Plotly.react(plot, plotData, layout);
}
function shiftData(xNew, i, yNew, trendNum) {
  const xShifted = xNew.map(x => x + i);
  const color = trendNum === 0 ? 'rgb(255,30,30)' : 'rgb(30,30,255)';
  const newData = {
    x: [].concat(xNew, xShifted),
    y: [].concat(yNew, yNew),
    type: 'scatter',
    mode: 'lines',
    opacity: 0.1,
    line: {
      width: 3,
      color: color
    },
    showlegend: false
  };
  
  var plotData = plot.data || [];
  plotData.push(newData);
  Plotly.react(plot, plotData, layout);
}

function updateData(x, y) {
  const newData = [{
    x,
    y,
    type: 'lines',
    color: 'black'
  }];
  Plotly.react(plot, newData,layout);
}

function generateYValues(xNew, yNew,sigma,mean) {
  for (let i = 0; i < xNew.length; i++) {
    const yVal = 1/(sigma*Math.sqrt(2*Math.PI))*Math.exp(-0.5*((xNew[i]-mean)/sigma)**2);
    yNew.push(yVal);
  }
}
var plotData = [];
var colors =['black','red','blue','green','orange','purple','brown','pink','gray','cyan','yellow','lime','teal','maroon'];
function updatePlot() {
  var confLevelRadioButtons = document.getElementsByName("confLevel");
  // Loop through radio buttons to find which one is selected
  var selectedConfLevel = "";
  for (var i = 0; i < confLevelRadioButtons.length; i++) {
    if (confLevelRadioButtons[i].checked) {
      selectedConfLevel = confLevelRadioButtons[i].value;
      cl = confLevelRadioButtons[i].id
      break;
    }
  }
  t = t+1;
  var mean = 0;
  var n = speedSlider.value;
  var sigma = 10/Math.sqrt(n);
  const l = 50;
  const ucl = selectedConfLevel * sigma;
  const dx = linspace(0, ucl, l)
  const xNew = linspace(-3*sigma, 3*sigma, 100);
  const yNew = [];
  
  generateYValues(xNew, yNew,sigma,mean);
  
  updateData(xNew, yNew);
  
  var errx = [].concat(ucl); // initialize errx as its own array and add uclvalue to it
  
  for (let i = 0; i < l; i++) {
    const ddx = dx[i];
    setTimeout(() => shiftData(xNew, ddx, yNew, 0), 1); // change trendNum to 0
  }
  setTimeout(() => addCI(xNew, yNew, ucl,maxy,0),100);
  for (let i = 0; i < l; i++) {
    const ddx = dx[i]
    setTimeout(() => shiftData(xNew, -ddx, yNew, 1), 1); // change trendNum to 1
  }
  var maxy = Math.max(...yNew);
  
  setTimeout(() => addCI(xNew, yNew, -ucl,maxy,1),100);
  
  
  
  const str = 'n= ' + n.toString() + ', conf. lvl= '+ cl+'%';
  plotData.push({
    x: [].concat(x, mean),
    y: [].concat(y, t),
    name: str,
    error_x: {
      type: 'data',
      array: errx,
      visible: true
    },
    type: 'scatter',
    mode: 'markers',
    marker: {
      color: colors[t],
      size: 20
    },
    showlegend: true
  });
  
  Plotly.react(plot2, plotData, layout2);
}


function showSpeed() {
  var slider = document.getElementById("speedSlider");
  var output = document.getElementById("speedReadout");
  output.innerHTML = slider.value;
}
