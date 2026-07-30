console.log("JavaScript is running!");

function imageToASCII(inputfile){
    const img = document.createElement('img')
    img.src = URL.createObjectURL(inputfile);

    //waits for image to load before continuing
    img.onload = function() {
        //Create an in memory canvas matching the image size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let ratio = img.height/img.width;
        const horizontal = horizontalSlider.valueAsNumber;
        const vertical = Math.round(horizontal * ratio * 0.45); //due to the fact that a single character is taller then it is wide, i set a ratio of 0.45 for horizontal vs vertical
        canvas.width = horizontal;
        canvas.height = vertical;
        ctx.drawImage(img, 0, 0, horizontal, vertical);

        let pixelData = ctx.getImageData(0,0, horizontal, vertical).data;

        function getPixelChar(xPos, yPos){
            let position = (xPos + (yPos * horizontal)) * 4
            let red = pixelData[position]
            let green = pixelData[position+1]
            let blue = pixelData[position+2]
            let alpha = pixelData[position+3]

            //according to searches, certain colors effect brightness more so red, green and blue have diff effects on brightness
            brightness = ((0.2126*red + 0.7152*green + 0.0722*blue)/255) * (alpha/255)
            //console.log(brightness)
            return asciiChars[Math.floor(asciiChars.length * brightness)]
        }

        let outputString = "";

        for (let y = 0; y < vertical; y++) {
            for (let x = 0; x < horizontal; x++) {
                outputString += getPixelChar(x, y);
            }
            outputString += "\n";
        }
        asciiOutput.textContent = outputString;

        console.log(input.value);
        
        outputimage.src = URL.createObjectURL(inputfile)
    }
}

function videoToASCII(inputfile){
    let outputString = [];
    let interval = 1/fpsSlider.value

    const vid = document.createElement('video')
    vid.src = URL.createObjectURL(inputfile);

    //waits for video's data to load before continuing
    vid.onloadeddata = function() {
        //Create an in memory canvas matching the video size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let ratio = vid.videoHeight/vid.videoWidth;
        const horizontal = horizontalSlider.valueAsNumber;
        const vertical = Math.round(horizontal * ratio * 0.45); //due to the fact that a single character is taller then it is wide, i set a ratio of 0.45 for horizontal vs vertical
        canvas.width = horizontal;
        canvas.height = vertical;
        ctx.drawImage(vid, 0, 0, horizontal, vertical);

        let pixelData = ctx.getImageData(0,0, horizontal, vertical).data;

        function getPixelChar(xPos, yPos){
            let position = (xPos + (yPos * horizontal)) * 4
            let red = pixelData[position]
            let green = pixelData[position+1]
            let blue = pixelData[position+2]
            let alpha = pixelData[position+3]

            //according to searches, certain colors effect brightness more so red, green and blue have diff effects on brightness
            brightness = ((0.2126*red + 0.7152*green + 0.0722*blue)/255) * (alpha/255)
            //console.log(brightness)
            return asciiChars[Math.floor(asciiChars.length * brightness)]
        }
        
        let length = vid.duration;
        let seekTime = 0;
        //i use recurrsion as there were issues with a for loop continuing before the frame was finished rendering
        function recursiveVideoToFrame(){
            if(seekTime + interval <= length){
                let startTime = performance.now();  
                //console.log(seekTime+"/"+length);
                vid.currentTime = seekTime;
                vid.onseeked = function() {
                    ctx.drawImage(vid, 0, 0, horizontal, vertical);
                    pixelData = ctx.getImageData(0,0, horizontal, vertical).data;
                    let output = "";
                    outputString.push("");
                    for (let y = 0; y < vertical; y++) {
                        for (let x = 0; x < horizontal; x++) {
                            let char = getPixelChar(x, y)
                            output += char;
                            outputString[outputString.length-1] += char;
                        }
                        output += "\n";
                        outputString[outputString.length-1] += "\n";
                    }
                    seekTime += interval;
                    if(!prerender.checked){
                        asciiOutput.textContent = output;
                        setTimeout(() => {recursiveVideoToFrame();}, Math.max(0,(1000 * interval) - (performance.now() - startTime)));
                    }
                    else{
                        asciiOutput.textContent = "Rendering " + Math.round((seekTime / length)*100) + "% progress"
                        recursiveVideoToFrame();
                    }
                }
            }
            if(seekTime + interval > length){
                prerenderDisplay();
            }
        }

        recursiveVideoToFrame();
        
        let curr = 0;
        let startTime = null;
        function prerenderDisplay(){
            if(startTime == null){
                startTime = performance.now();  
            }
                
            asciiOutput.textContent = outputString[curr];
            curr += 1;

            if(curr % outputString.length == 0){
                curr = 0;
                startTime = performance.now();
            }
            
            //delay builds up overtime causing the output to be out of sync compared to the input, so i reduce the wait time based on delay
            let nodelay = startTime + (curr * interval * 1000);
            let delay = nodelay - performance.now();

            setTimeout(prerenderDisplay, Math.max(0, delay));
        }
        
    }

}

function convertToASCII(){
    outputimage = document.querySelector('img');
    outputvideo = document.querySelector('video');
    inputfile = input.files[0];
    console.log(inputfile.type);

    if(inputfile.type.startsWith("image/")){
        imageToASCII(inputfile);
        convertButton.textContent = "Reset";
        convertButton.onclick = reset;
    }
    else if(inputfile.type.startsWith("video/")){
        videoToASCII(inputfile);
        convertButton.textContent = "Reset";
        convertButton.onclick = reset;
    }
    
    
}

function reset(){
    window.location.reload();
}

//get the needed HTML elements
const input = document.getElementById("input");
const convertButton = document.getElementById("converter");
const asciiOutput = document.getElementById("output");
const horizontalSlider = document.getElementById("horizontalSlider")
const fpsSlider = document.getElementById("framerate")
const prerender = document.getElementById("prerender")
const asciiChars = "@#*=-:. ";

//event listeners
convertButton.addEventListener("click", convertToASCII);
horizontalSlider.addEventListener("input", ()=>{
    document.getElementById("sliderNum").textContent = horizontalSlider.value.toString() + " characters.";
});
fpsSlider.addEventListener("input", ()=>{
    document.getElementById("fpsNum").textContent = fpsSlider.value.toString() + " fps.";
});