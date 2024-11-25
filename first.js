 const typingform = document.querySelector(".typing-form");
 const chatList = document.querySelector(".chat-list");
 const suggestion = document.querySelectorAll(".suggestion-list .suggestion");
 const toggleThemeButton = document.querySelector("#toggle-theme-button");
 const deleteChatButton = document.querySelector("#delete-Chat-Button");

 let userMassage = null;
 let isResponseGenerating = false; 

// API configuration 
 const API_KEY =  "AIzaSyCVIWQP_kcQ3YzNEwbMCaLFc8pSbPkO8cc";
 const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;


 const loadLocalStorageData = () => {
  const savedChats = localStorage.getItem("savedChats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode")
  
  // Apply the stored Theme
  document.body.classList.toggle("light_mode" , isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";



  // Restore saved chats
  chatList.innerHTML = savedChats || "";

  document.body.classList.toggle("hide-header", savedChats);
  chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the Buttom
 }

    loadLocalStorageData(); 


 // Create a new massage element and return it 
  const createMassageElement = (contant, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("massage", ...classes);
  div.innerHTML = contant;
  return div;
 }

  // show typing effect by displaying words one by one 
 const showTypingEffect = (text, textElemtent,  incomingMassageDiv) => {
  const words = text.split(' ');
  let currentWorldIndex = 0;

  const typingIntervals = setInterval(() => {
    // Append each word to the text element with a space
    textElemtent.innerText += (currentWorldIndex === 0 ? `` : `  `) + words[currentWorldIndex++]; 
    incomingMassageDiv.querySelector(".icon").classList.add("hide");


   // if all words are displayed 
    if(currentWorldIndex === words.length) {
      clearInterval(typingIntervals);
      isResponseGenerating = false;
      incomingMassageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("savedChats" , chatList.innerHTML);  // Save chats to local Storage
     }
     chatList.scrollTo(0, chatList.scrollHeight); // Scroll to the buttom
  }, 75);
 }

 //Fetch response from the API based on user massage
 const generateAPIResponse =  async (incomingMassageDiv) => {
  const textElemtent = incomingMassageDiv.querySelector(".text"); // Get text Elemtent 

  // Send a POST request to the API with the user's massage
  try{
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents:[{
          role: "user",
          parts: [{text: userMassage }]
        }]
      })
    }); 

    const data = await response.json();
    if(!response.ok) throw new Error (data.error.massage);


    // Get the API response text and remove asterisks from it
     const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
      showTypingEffect(apiResponse, textElemtent, incomingMassageDiv);
  } catch (error) {
    isResponseGenerating =  false;
    textElemtent.innerText = error.massage;
    textElemtent.classList.add("error");
  } finally {
    incomingMassageDiv.classList.remove("loading");
  }
 }

//  Show a loading animation while waiting for the API response 
 const showLoadingAnimation = () => {
  const html = `<div class="massage-contant">
                <img src="Images/gemini.svg" alt="Gemini Image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                 </div>
            </div>
            <span  onclick="copyMassage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMassageDiv = createMassageElement(html, "incoming", "loading"); 
  chatList.appendChild(incomingMassageDiv);


  chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the Buttom
  generateAPIResponse(incomingMassageDiv);
 }


  // Copy massage text to the clipboard  
  const copyMassage = (copyIcon) => {
    const massageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(massageText);
    copyIcon.innerText = "done"; // Show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // Revert icon after 1 second  
  }



    // Handle sending outgoing chat massage
    const handleOutgoingChat = () => {
   userMassage = typingform.querySelector(".typing-input").value.trim() || userMassage;
   if(!userMassage || isResponseGenerating) return; // Exits if there is no massage

   isResponseGenerating = true;
  

   const html = `<div class="massage-contant">
                <img src="Images/user.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`;

    const outgoingMassageDiv = createMassageElement(html, "outgoing");
    outgoingMassageDiv.querySelector(".text").innerText = userMassage;
    chatList.appendChild(outgoingMassageDiv);

    typingform.reset(); // Clear input field 
    chatList.scrollTo(0, chatList.scrollHeight); //Scroll to the Buttom
    document.body.classList.add("hide-header");  // Hide the header once start
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
 }

 // Set userMassage and outgoing chat with a suggestion is clicked 
 suggestion.forEach(suggestion => { userMassage
  suggestion.addEventListener("click", () => {
    userMassage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  })
 })



  //Toggle between light and dark themes 
  toggleThemeButton.addEventListener("click", () => {
     const isLightMode = document.body.classList.toggle("light_mode");
     localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  });

   

  // Delete all cahts from local storages when button  is clicked
  deleteChatButton.addEventListener("click", () => {
    if (confirm ("Are you sure to want delete all massage?")){
      localStorage.removeItem("savedChats");
      loadLocalStorageData();
    }
  });


  // Prevent default form submission and handle outgoing chat 
 typingform.addEventListener("submit", (e) => {
   e.preventDefault();

   handleOutgoingChat();

  });

 