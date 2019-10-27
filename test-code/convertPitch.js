var ConvertPitch = (() => {
  var context;
  var freqTable;
  var currentNodeIndex = 57;

  // $.getJSON('notes.json', function(data) {
  //   console.log(data);
  //   freqTable = data;
  // });

  $.ajax({
    url: 'notes.json',
    dataType: 'json',
    async: false,
    success: function(data) {
      freqTable = data;
    }
  });

  var notesArray = freqTable[440];

  var updateNote = function (note) {
		$('#note').text(note);
  };
  
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  context = new window.AudioContext();

  var init = () => {
    $(()=>{
      $("#play").click(()=>{
        try {     
          loadSound("test-c-soprano.wav");
        }
        catch(e) {
          alert(e);
        }
      })
    })
  };

  function loadSound(sound) {
    var request = new XMLHttpRequest();
    request.open('GET', sound, true);
    request.responseType = 'arraybuffer';

    request.onload = function(){
      context.decodeAudioData(request.response, function(buffer) {
        soundBuffer = buffer;
        playSound(soundBuffer);
        detectPitch(soundBuffer);
      });
    }
    request.send();

  }

  function playSound(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }
  return {
    init: init,
  }

 function findFundamentalFreq(buffer, sampleRate){
    var n = 1024, bestR = 0, bestK = -1;
    for(var k = 8; k <= 1000; k++){
      var sum = 0;

      for(var i = 0; i < n; i++){
        sum += ((buffer[i] - 128) / 128) * ((buffer[i+k] - 128) / 128);
      }

      var r = sum / (n+k);

      if (r > bestR) {
        bestR = r;
        bestK = k;
      }

      if (r > 0.9) {
        break;
      }
    };

    if (bestR > 0,0025) {
      var fundamentalFreq = sampleRate / bestK;
      return fundamentalFreq;
    }
    else {
      return -1;
    }
  };

  var frameID;

  function detectPitch (buffer) {
    var fundamentalFreq = findFundamentalFreq(buffer, 8);

    if (fundamentalFreq !== -1){
      var note = findClosestNote(fundamentalFreq, notesArray);
      updateNote(note.note);
    }
    else {
      updateNote('--');
    }
  };

  function findClosestNote(freq, notes) {
    freq = 500;
    var low = -1, high = notes.length;
    while (high - low > 1){
      var pivot = Math.round((low + high) / 2);
      console.log(notes[pivot].frequency);
      if (notes[pivot].frequency <= freq) {
        low = pivot;
      } else {
        high = pivot;
      }
    }

    if(Math.abs(notes[high].frequency - freq) <= Math.abs(notes[low].frequency - freq)) {
      return notes[high];
    }

    return notes[low];
  };
})();

ConvertPitch.init();