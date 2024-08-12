document.addEventListener("DOMContentLoaded", () => {

    const qrBtn = document.querySelector(".qrBtn");
    const closeBtn = document.querySelector("#closeBtn");
    const popup = document.getElementById("qrFormatContainer");

    qrBtn.addEventListener("click", function(event){
    event.preventDefault(); // Prevent the default anchor behavior
    popup.style.display = "flex"; // Show the popup

    // Add event listeners to the buttons
    const pngBtn = document.getElementById("qrPngBtn");
    pngBtn.addEventListener("click", () => {
        console.log("User selected PNG");
        popup.style.display = "none"; // Hide the popup
    });

    const svgBtn = document.getElementById("qrSvgBtn");
    svgBtn.addEventListener("click", () => {
        console.log("User selected SVG");
        popup.style.display = "none"; // Hide the popup
    });
    })
    // Function to close the popup
    function closePopup() {
        popup.style.display = 'none';
    }

    closeBtn.addEventListener("click", function(event) {
        closePopup();
    });
    // Add event listener to handle clicks outside of the popup
    popup.addEventListener("click", function(event) {
        if (!event.target.closest("#qrFormatPopup")) {
            closePopup();
        }   
    });
});