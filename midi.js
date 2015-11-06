;(function(global) {
  'use strict';

  function Midi() {}
  global.Midi = Midi;
  Midi.prototype.changeOutput = changeOutput;
  Midi.prototype.getOutput = getOutput;

  var outputSelect = null;
  var outputList;

  try {
    if (global.navigator.requestMIDIAccess) {
      global.navigator.requestMIDIAccess().then(function(midiAccess) {
        var outputCmb = global.document.getElementById('outputPort');
        if (typeof midiAccess.outputs === "function") {
          outputList = midiAccess.outputs();
          for (var i = 0; i < outputList.length; i++) {
            var output = outputList[i];
            outputCmb.appendChild(new global.Option(output.manufacturer + ' ' + output.name, output.id ));
          }
          outputCmb.appendChild(new global.Option('NONE', -1));
          outputSelect = outputList.length > 0 ? outputList[0] : null;
        } else {
          outputList = [];
          var outputItr = midiAccess.outputs.values();
          for (var output = outputItr.next(); !output.done; output = outputItr.next()) {
            var v = output.value;
            outputList.push(v);
            outputCmb.appendChild(new global.Option(v.manufacturer + ' ' + v.name, v.id));
          }
          outputCmb.appendChild(new global.Option('NONE', -1));
          outputSelect = outputList.length > 0 ? outputList[0] : null;
        }
      },
      function(msg) {
        global.alert('Failed to get MIDI access - ' + msg);
      });
    } else {
      global.alert('お使いのブラウザはWeb MIDI APIに対応していません。Web MIDI APIを有効化したChromeを使用してください。');
    }
  } catch (e) {
    global.console.log(e);
  }

  function changeOutput() {
    var outputCmb = global.document.getElementById('outputPort');
    var selectIndex = outputCmb.selectedIndex;
    var outLength = outputList.length;

    outputSelect = null;
    for (var i = 0; i < outLength; i++) {
      var output = outputList[i];
      if (outputCmb.options[selectIndex].value === output.id) {
        outputSelect = output;
        break;
      }
    }
  }

  function getOutput() {
    return outputSelect;
  }
})((this || 0).self || global);
