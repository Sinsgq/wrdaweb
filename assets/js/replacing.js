var textObjects = [
    { text: "Discord", href: "dsg.gg/wrda" },
    { text: "Instagram", href: "https://www.instagram.com/whiterose_driftalliance" },
    { text: "Youtube", href: "https://www.youtube.com/@WhiteRose_DriftAlliance" },
    { text: "Twitter", href: "https://x.com/WhiteRoseDrift" }
];
var currentIndex = 0;
var speed = 50; // typing speed in milliseconds

// Listen for the click event on the "enterText" element
document.getElementById('enter-text').addEventListener('click', function() {
  // Start the typing process after the user clicks "enterText"
  startTyping();
});

// Additional click event listener for the "autoScrollText" element
document.getElementById('autoScrollText').addEventListener('click', function() {
  // Handle the click action, for example, you can open a link
  var textObject = textObjects[currentIndex];
  window.open(textObject.href, '_blank'); // Open link in a new tab
});

function startTyping() {
  var element = document.getElementById('autoScrollText');
  var textObject = textObjects[currentIndex];
  typeAndDelete(element, textObject.text, textObject.href, speed, function() {
    currentIndex = (currentIndex + 1) % textObjects.length;
    startTyping(); // Continue with the next text
  });
}

function typeAndDelete(element, text, href, speed, callback) {
  var index = 0;

  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, speed);
    } else {
      // Typing complete
      // Wait for a moment before starting deletion
      setTimeout(function() {
        deleteText(element, text, speed, callback);
      }, 1500);
    }
  }

  // Start typing
  type();
}

function deleteText(element, text, speed, callback) {
  var index = text.length;

  function deleteChar() {
    if (index > 0) {
      element.innerHTML = text.substring(0, index - 1);
      index--;
      setTimeout(deleteChar, speed);
    } else {
      // Deletion complete
      callback(); // Execute callback
    }
  }

  // Start deletion
  deleteChar();
}
