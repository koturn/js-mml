function parseMML(mmlSource) {
  var midiCmds = [];
  var cmdIdx = 0;

  var baseNoteNr = {c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11};
  var globProp = {
    tempo: 120.0,
    noteLen: 4,
    velocity: 127,
    octave: 4
  }
  var noteProp = {
    noteNr: 60,
    chromaticOffset: 0,
    noteLen: globProp.noteLen
  };

  mmlSource = mmlSource.toLowerCase();
  console.log(mmlSource);
  for (var i = 0; i < mmlSource.length; i++) {
    var c = mmlSource[i];
    switch (c) {
      case 'c': case 'd': case 'e': case 'f': case 'g': case 'a': case 'b':
        // chromatic
        noteProp.chromaticOffset = 0;
        if (i + 1 < mmlSource.length && (mmlSource[i + 1] === '+' ||  mmlSource[i + 1] === '-')) {
          for (i = i + 1; i < mmlSource.length; i++) {
            if (mmlSource[i] === '+') {
              noteProp.chromaticOffset++;
            } else if (mmlSource[i] === '-') {
              noteProp.chromaticOffset--;
            } else {
              break;
            }
          }
          i--;
        }
        noteProp.noteNr = baseNoteNr[c] + (globProp.octave + 1) * 12 + noteProp.chromaticOffset;

        // note-length
        if (i + 1 < mmlSource.length && isdigit(mmlSource[i + 1])) {
          var intStr = '';
          for (i = i + 1; i < mmlSource.length && isdigit(mmlSource[i]); i++) {
            intStr += mmlSource[i];
          }
          noteProp.noteLen = Number(intStr);
          i--;
        } else {
          noteProp.noteLen = globProp.noteLen;
        }

        if (i + 1 < mmlSource.length && mmlSource[i + 1] === '.') {
          for (i = i + 1; i < mmlSource.length && mmlSource[i] === '.'; i++) {
            noteProp.noteLen /= 1.5;
          }
          i--;
        }

        midiCmds[midiCmds.length] = {
          noteOn: [0x90, noteProp.noteNr, globProp.velocity],
          noteOff: [0x80, noteProp.noteNr, globProp.velocity],
          isNote: true,
          length: 60 * 1000 * (4.0 / noteProp.noteLen) / globProp.tempo
        };
        break;
      case 'r':
        if (i + 1 < mmlSource.length && isdigit(mmlSource[i + 1])) {
          var intStr = '';
          for (i = i + 1; i < mmlSource.length && isdigit(mmlSource[i]); i++) {
            intStr += mmlSource[i];
          }
          noteProp.noteLen = Number(intStr);
          i--;
        } else {
          noteProp.noteLen = globProp.noteLen;
        }

        if (i + 1 < mmlSource.length && mmlSource[i + 1] === '.') {
          for (i = i + 1; i < mmlSource.length && mmlSource[i] === '.'; i++) {
            noteProp.noteLen /= 1.5;
          }
          i--;
        }

        midiCmds[midiCmds.length] = {
          isNote: false,
          length: 60 * 1000 * (4.0 / noteProp.noteLen) / globProp.tempo
        };
        break;
      case '<':
        globProp.octave++;
        break;
      case '>':
        globProp.octave--;
        break;
      case 'o':
        i++;
        globProp.octave = Number(mmlSource[i]);
        break;
      case 't':
        var intStr = '';
        for (i = i + 1; i < mmlSource.length && isdigit(mmlSource[i]); i++) {
          intStr += mmlSource[i];
        }
        i--;
        globProp.tempo = Number(intStr);
        break;
      case 'l':
        i++;
        globProp.noteLen = Number(mmlSource[i]);
        break;
      default:
        break;
    }
  }
  return midiCmds;
}


var ZERO = String.fromCharCode('0');
var NINE = String.fromCharCode('9');
function isdigit(c) {
  return c.match(/[0-9]/);
}


function playMidi(midiCmds) {
  var basetime = performance.now();
  var time = basetime;
  for (var i = 0; i < midiCmds.length; i++) {
    var cmd = midiCmds[i];
    if (cmd.isNote) {
      outputSelect.send(cmd.noteOn, time);
      time += cmd.length;
      outputSelect.send(cmd.noteOff, time);
    } else {
      time += cmd.length;
    }
  }
}


function play() {
  var mmlSource = $('#mml').val();
  var midiCmds = parseMML(mmlSource);
  playMidi(midiCmds);
}
