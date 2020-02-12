/* eslint-disable no-undef */
$(document).ready(function() {
  function arrayToRGB([r, g, b]) {
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }

  $(
    "#formPlantPhoto, label[for='formPlantPhoto'], #formPhotoWater, label[for='formPhotoWater']"
  ).click(function() {
    $("#formPlantColor").val("");
  });

  $("#formPlantPhoto, #formPhotoWater").change(function() {
    // eslint-disable-next-line no-undef
    const colorThief = new ColorThief();
    const image = document.getElementById("imgPlantPhoto");
    image.src = URL.createObjectURL(this.files[0]);
    const indicator = document.querySelector("#imgPlantIndicator");

    // Make sure image is finished loading
    if (image.complete) {
      const dominant = colorThief.getColor(image);
      indicator.style.backgroundColor = arrayToRGB(dominant);
      $("#formPlantColor").val(arrayToRGB(dominant));
    } else {
      image.addEventListener("load", function() {
        const dominant = colorThief.getColor(image);
        indicator.style.backgroundColor = arrayToRGB(dominant);
        $("#formPlantColor").val(arrayToRGB(dominant));
      });
    }
  });

  $(".plants__list--water").click(e => {
    window.location = `/plants/${e.target.parentNode.getAttribute("key")}`;
  });
});
