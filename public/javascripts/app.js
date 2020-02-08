/* eslint-disable no-undef */
$(document).ready(function() {
  $(
    "#formPlantPhoto, label[for='formPlantPhoto'], #formPhotoWater, label[for='formPhotoWater']"
  ).click(function() {
    $("#formPlantColor").val("");
  });

  $("#formPlantPhoto, #formPhotoWater").change(function() {
    // eslint-disable-next-line no-undef
    const fac = new FastAverageColor();
    const image = document.getElementById("imgPlantPhoto");
    image.src = URL.createObjectURL(this.files[0]);

    const indicator = document.querySelector("#imgPlantIndicator");
    fac
      .getColorAsync(image)
      .then(function(color) {
        indicator.style.backgroundColor = color.rgba;
        $("#formPlantColor").val(color.rgba);
        indicator.style.color = color.isDark ? "#fff" : "#000";
      })
      .catch(function(e) {
        console.log(e);
      });
  });

  $(".plants__list--water").click(e => {
    window.location = `/plants/${e.target.parentNode.getAttribute("key")}`;
  });
});
