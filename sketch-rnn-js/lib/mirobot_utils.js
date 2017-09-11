var mirobot_draw_json = function(doc,mirobot){
    var previousRadians = 0;

    drawDoc(doc);

    function drawDoc(doc){
        doc = flattenDoc(doc);
        doc = flattenPaths(doc);
        
        var path = doc.layers[0].paths[0];
        var points = path.points;
        var numPoints = points.length;
        
        var first = points[0];
        var last  = points[numPoints-1];
        //goto first position without drawing
        mirobot.penup();
        line(first,[0,0]);
        
        mirobot.pendown();
        var isPenDown = true;
        
        for(var k = 1; k < numPoints; k++){
          
            var current  = points[k];
            var previous = points[k-1];
          
            var lastPathIndex = path.separators[0];
            if(k == lastPathIndex){
                mirobot.penup();
                isPenDown = false;
                path.separators.shift();
            }else{
                if(!isPenDown){
                    mirobot.pendown();
                    isPenDown = true;
                }
            }
            
            line(current,previous);
            
        }
        
        mirobot.penup();
        // mirobot.beep();
    }
    function flattenDoc(doc){
    	var newDoc = JSON.parse(JSON.stringify(doc));
    	var flattenedLayers = [{"name":"FlattenedLayer","paths":[]}];
    	for(var i = 0; i < newDoc.layers.length; i++){
    		if(newDoc.layers[i].paths === undefined) continue;
    		flattenedLayers[0].paths = flattenedLayers[0].paths.concat(newDoc.layers[i].paths);
    	}
    	newDoc.layers = flattenedLayers;
    	return newDoc;
    }
    function flattenPaths(doc){
    	//assuming flattened layers
    	var paths = [{"name":"PathItem",points:[],separators:[]}];
    	var index = 0;
    	for(var i = 0 ; i < doc.layers[0].paths.length; i++){
    		var points = doc.layers[0].paths[i].points;
    		//copy first point as last if path is closed
    		if(doc.layers[0].paths[i].closed){
    			points.push(points[0]);
            }
    		index += points.length;
    		//asbolute point indexing
    		paths[0].separators.push(index);
    		paths[0].points = paths[0].points.concat(points);
    	}
    	return {"layers":[{"name":"Layer 1","paths":paths}]};
    }
    function map(value,start1, stop1,start2, stop2) {
      return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    function degrees(radians){
        return radians * 57.2958;
    }
    function turtleAngle(radians){
      const TWO_PI = Math.PI * 2;
      const HALF_PI = Math.PI * 0.5;
      return (map(radians,-Math.PI,Math.PI,0,TWO_PI)+Math.PI+HALF_PI) % TWO_PI;
    }
    function shortRotation(startAngle,endAngle){
      const TWO_PI = Math.PI * 2;
      //angle difference wrapped around TWO_PI
      var diff = (endAngle - startAngle) % TWO_PI;
      //check if the angle wraps around PI (180), if so append ore prepend TWO_PI (360) to the current angle
      if(diff != diff % Math.PI){
        diff = (diff < 0 ? diff + TWO_PI : diff - TWO_PI);
      }
      return diff;
    }
    function line(current,previous){
        var dx      = current[0]-previous[0];
        var dy      = current[1]-previous[1];
        var distance= Math.sqrt(dx*dx + dy*dy);
        var radians = turtleAngle(Math.atan2(dy,dx));
        var shortAngle = shortRotation(previousRadians,radians);
        var degs = degrees(shortAngle);
        //simulator doesn't like left(0) or right(0)!
        if(degs === 0) degs = 0.01;
        
        mirobot.left(degs);
        mirobot.forward(distance);
        
        previousRadians = radians;
    }
}

var mirobot_draw_json_without_last_line = function(doc,mirobot,xoffset=0){
    var previousRadians = 0;

    drawDoc(doc);

    function drawDoc(doc){
        doc = flattenDoc(doc);
        doc = flattenPaths(doc);
        
        var path = doc.layers[0].paths[0];
        var points = path.points;
        var numPoints = points.length;
        
        var first = points[0];
        var last  = points[numPoints-1];
        //goto first position without drawing
        mirobot.penup();
        line(first,[0,0]);
        
        mirobot.pendown();
        var isPenDown = true;
        
        for(var k = 1; k < numPoints; k++){
          
            var current  = points[k];
            var previous = points[k-1];
            //add offset
            current[0] += xoffset;
          
            var lastPathIndex = path.separators[0];
            if(k == lastPathIndex){
                mirobot.penup();
                isPenDown = false;
                path.separators.shift();
            }else{
                if(!isPenDown){
                    mirobot.pendown();
                    isPenDown = true;
                }
            }

            if(k > numPoints-3 && isPenDown){
                mirobot.penup();
                isPenDown = false;
            }

            
            line(current,previous);
            
        }
        
        mirobot.penup();
        // mirobot.beep();
    }
    function flattenDoc(doc){
        var newDoc = JSON.parse(JSON.stringify(doc));
        var flattenedLayers = [{"name":"FlattenedLayer","paths":[]}];
        for(var i = 0; i < newDoc.layers.length; i++){
            if(newDoc.layers[i].paths === undefined) continue;
            flattenedLayers[0].paths = flattenedLayers[0].paths.concat(newDoc.layers[i].paths);
        }
        newDoc.layers = flattenedLayers;
        return newDoc;
    }
    function flattenPaths(doc){
        //assuming flattened layers
        var paths = [{"name":"PathItem",points:[],separators:[]}];
        var index = 0;
        for(var i = 0 ; i < doc.layers[0].paths.length; i++){
            var points = doc.layers[0].paths[i].points;
            //copy first point as last if path is closed
            if(doc.layers[0].paths[i].closed){
                points.push(points[0]);
            }
            index += points.length;
            //asbolute point indexing
            paths[0].separators.push(index);
            paths[0].points = paths[0].points.concat(points);
        }
        return {"layers":[{"name":"Layer 1","paths":paths}]};
    }
    function map(value,start1, stop1,start2, stop2) {
      return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    function degrees(radians){
        return radians * 57.2958;
    }
    function turtleAngle(radians){
      const TWO_PI = Math.PI * 2;
      const HALF_PI = Math.PI * 0.5;
      return (map(radians,-Math.PI,Math.PI,0,TWO_PI)+Math.PI+HALF_PI) % TWO_PI;
    }
    function shortRotation(startAngle,endAngle){
      const TWO_PI = Math.PI * 2;
      //angle difference wrapped around TWO_PI
      var diff = (endAngle - startAngle) % TWO_PI;
      //check if the angle wraps around PI (180), if so append ore prepend TWO_PI (360) to the current angle
      if(diff != diff % Math.PI){
        diff = (diff < 0 ? diff + TWO_PI : diff - TWO_PI);
      }
      return diff;
    }
    function line(current,previous){
        var dx      = current[0]-previous[0];
        var dy      = current[1]-previous[1];
        var distance= Math.sqrt(dx*dx + dy*dy);
        var radians = turtleAngle(Math.atan2(dy,dx));
        var shortAngle = shortRotation(previousRadians,radians);
        var degs = degrees(shortAngle);
        //simulator doesn't like left(0) or right(0)!
        if(degs === 0) degs = 0.01;
        
        mirobot.left(degs);
        mirobot.forward(distance);
        
        previousRadians = radians;
    }
}