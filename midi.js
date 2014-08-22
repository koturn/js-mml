var midi = null;  // グローバルMIDIAccessオブジェクト
var inputSelect = null;
var inputList = null;
var outputSelect = null;
var outputList = null;

try {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({sysex:false}).then(function(midiAccess) {
      dispMessage('MIDI ready!');
      midi = midiAccess;

      var inputCmb = document.getElementById('inputPort');
      var inLength = midi.inputs().length;
      inputList = midi.inputs();
      for (var i = 0; i < inLength; i++) {
        var input = midi.inputs()[i];
        inputCmb.appendChild(new Option(input.manufacturer + ' ' + input.name, input.id ));
      }
      document.getElementById('inCount').innerHTML = inLength;

      var outputCmb = document.getElementById('outputPort');
      var outLength = midi.outputs().length;
      outputList = midi.outputs();
      for ( var i = 0; i < outLength; i++ ) {
        var output = midi.outputs()[i];
        outputCmb.appendChild(new Option(output.manufacturer + ' ' + output.name, output.id ))
      }
      document.getElementById('outCount').innerHTML = outLength;

      changeInput();
      changeOutput();
    },
    function(msg) {
      dispMessage('Failed to get MIDI access - ' + msg );
    });
  } else {
    dispMessage('お使いのブラウザはWeb MIDI APIに対応していません。Web MIDI APIを有効化したChromeを使用してください。');
  }
} catch (e) {
  dispMessage('お使いのブラウザはWeb MIDI APIに対応していません。Web MIDI APIを有効化したChromeを使用してください。');
}


function echoMIDIMessage(event) {
  if (outputSelect) {
    try {
      outputSelect.send( event.data );
      dispMessage('MIDI IN : ' + event.data[0].toString(16)
                  + ' ' + event.data[1].toString(16)
                  + ' ' + event.data[2].toString(16));
    } catch (e) {
      dispMessage(e);
    }
  }
}


// var before = [0x80, 60, 0x7f];
function echoMIDIMessage2(data0, data1) {
  if (outputSelect) {
    try {
      outputSelect.send([data0, data1, 0x7f]);
      outputSelect.send([0x80, data1, 0x7f], performance.now() + 1000.0);
      dispMessage( 'MIDI IN : ' + data0.toString(16)
                  + ' ' + data1.toString(16)
                  + ' ' + 0x7f.toString(16) );
    } catch(e) {
      dispMessage(e);
    }
  }
}




function changeInput() {
  var inputCmb = document.getElementById('inputPort');
  var selectIndex = inputCmb.selectedIndex;
  var inLength = inputList.length;

  for (var i = 0; i < inLength; i++) {
    var input = inputList[i];
    if (inputCmb.options[selectIndex].value == input.id) {
      inputSelect = input;
      inputSelect.onmidimessage = echoMIDIMessage;
    } else {
      input.onmidimessage = null;
    }
  }
}


function changeOutput() {
  var outputCmb = document.getElementById('outputPort');
  var selectIndex = outputCmb.selectedIndex;
  var outLength = outputList.length;
  for (var i = 0; i < outLength; i++) {
    var output = outputList[i];
    if  (outputCmb.options[selectIndex].value == output.id) {
      outputSelect = output;
      break;
    }
  }
}


function dispMessage(message){
  var messageArea = document.getElementById('messageArea');
  if (messageArea) {
    messageArea.innerHTML = message;
  } else {
    alert(message);
  }
}
