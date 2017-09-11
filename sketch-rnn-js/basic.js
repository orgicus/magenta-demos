var sketch = function( p ) { 

  var model;
  var dx, dy; // offsets of the pen strokes, in pixels
  var pen_down, pen_up, pen_end; // keep track of whether pen is touching paper
  var x = 0, y = 0; // absolute coordinates on the screen of where the pen is
  var prev_pen = [1, 0, 0]; // group all p0, p1, p2 together
  var rnn_state; // store the hidden states of rnn's neurons
  var pdf; // store all the parameters of a mixture-density distribution
  var temperature = 0.65; // controls the amount of uncertainty of the model
  var line_color;
  var count = 0;

  p.setup = function() {
    var screen_width = Math.max(window.innerWidth, 480);
    var screen_height = Math.max(window.innerHeight, 320);

    var model_data = JSON.parse(model_raw_data);
    p.model = new SketchRNN(model_data); // assume we have a model_data
    p.createCanvas(screen_width, screen_height);
    p.frameRate(60);

    // initialize the scale factor for the model. Bigger -> large outputs
    p.model.set_pixel_factor(2.0);

    // initialize pen's states to zero.
    // [dx, dy, pen_down, pen_up, pen_end] = p.model.zero_input(); // the pen's states

    // zero out the rnn's initial states
    // rnn_state = p.model.zero_state();

    // define color of line
    line_color = p.color(p.random(64, 224), p.random(64, 224), p.random(64, 224));

    console.log(p.get_rnn_samples(p.model));
  };

  p.get_rnn_samples = function(lmodel,temperature=0.65){
    let ldx, ldy; // offsets of the pen strokes, in pixels
    let lpen_down, lpen_up, lpen_end; // keep track of whether pen is touching paper
    
    [ldx, ldy, lpen_down, lpen_up, lpen_end] = lmodel.zero_input(); // the pen's states

    let lrnn_samples = [];
    let lsample = [];

    let lrnn_state = lmodel.zero_state();
    let lpdf;
    let lprev_pen = [1,0,0];
    console.log("lmodel",lmodel);
    console.log("lmodel.max_seq_length",lmodel.max_seq_length);

    console.log(lmodel.update([dx, dy, pen_down, pen_up, pen_end], lrnn_state));

    return;
    // while(true){
    for(var i = 0 ; i < 129; i++){
    // for(var i = 0 ; i < lmodel.max_seq_length; i++){
      lrnn_state = lmodel.update([dx, dy, pen_down, pen_up, pen_end], lrnn_state);  
      lpdf = lmodel.get_pdf(lrnn_state);

      
      [ldx, ldy, lpen_down, lpen_up, lpen_end] = lmodel.sample(lpdf, temperature);
      console.log(ldx, ldy, lpen_down, lpen_up, lpen_end);

      if (lprev_pen[2] == 1) {
        console.log("sampling complete");
        break;
      }

      if (lprev_pen[0] == 1) {
        // pen down
        lsample.push([ldx,ldy]);  
      }else{
        // pen up
        lrnn_samples.push([].concat(lsample));
        // sample.length = 0;
      }

      lprev_pen = [lpen_down, lpen_up, lpen_end];
    }
    return lrnn_samples;
  }

  p.draw = function() {
    return;
    // see if we finished drawing
    if (prev_pen[2] == 1) {
      p.noLoop(); // stop drawing
      return;
    }

    // using the previous pen states, and hidden state, get next hidden state
    // the below line takes the most CPU power, especially for large models.
    rnn_state = p.model.update([dx, dy, pen_down, pen_up, pen_end], rnn_state);

    // get the parameters of the probability distribution (pdf) from hidden state
    pdf = p.model.get_pdf(rnn_state);

    // sample the next pen's states from our probability distribution
    [dx, dy, pen_down, pen_up, pen_end] = p.model.sample(pdf, temperature);
    // console.log(dx, dy, pen_down, pen_up, pen_end);
    p.push();
    p.translate(300,300);
    // only draw on the paper if the pen is touching the paper
    if (prev_pen[0] == 1) {
      p.stroke(line_color);
      p.strokeWeight(2.0);
      p.line(x, y, x+dx, y+dy); // draw line connecting prev point to current point.
      console.log(x,y,x+dx,y+dy);
    }else{
      console.log("pen up");
      p.noLoop();
      return;
    }
    p.pop();
    p.line(0,0,p.frameCount,p.frameCount);

    // update the absolute coordinates from the offsets
    x += dx;
    y += dy;

    // update the previous pen's state to the current one we just sampled
    prev_pen = [pen_down, pen_up, pen_end];
    count++;

    console.log("count",count);
  };

  p.keyPressed = function(key){
    console.log(key);
  }
}

var custom_p5 = new p5(sketch, 'sketch');