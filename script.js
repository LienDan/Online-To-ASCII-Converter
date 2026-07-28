console.log("JavaScript is running!");

function convertToASCII(){
    outputimage = document.querySelector('img');
    inputfile = input.files[0];
    const img = new Image();

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
        console.log(pixelData);

        const asciiChars = "@#*=-:. ";

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

        outputString = "";

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

//get the needed HTML elements
const input = document.getElementById("input");
const convertButton = document.getElementById("converter");
const asciiOutput = document.getElementById("output");
const horizontalSlider = document.getElementById("horizontalSlider")

//event listeners
convertButton.addEventListener("click", convertToASCII);
horizontalSlider.addEventListener("input", ()=>{
    console.log("TEST");
    document.getElementById("sliderNum").textContent = horizontalSlider.value.toString() + " characters.";
});