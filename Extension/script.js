document.getElementById("extractButtonimage").addEventListener('click', async () => {
    try {
        const jokeElement = document.getElementById('extracted-text2');
        const loader = document.getElementById('loader2');
        loader.style.display = 'inline-block';
        jokeElement.textContent = "Processing... Please wait.";

        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            jokeElement.textContent = "Please select a file!";
            loader.style.display = 'none';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        let response = await fetch('http://127.0.0.1:8000/verify_Imagearticle', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
        }

        let data = await response.json();
        console.log("API Response:", data);

        loader.style.display = 'none';

        const classification = data.verification.result || "No classification found";

        jokeElement.innerHTML = `<p>${classification}</p>`;


    } catch (err) {
        console.error("Error:", err);
        document.getElementById('extracted-text').textContent = "Error fetching classification!";
    }
});


document.getElementById("extractButtontext").addEventListener('click', async () => {
    try {
        const jokeElement = document.getElementById('extracted-text1');
        const loader = document.getElementById('loader1');
        loader.style.display = 'inline-block';

        // Step 1: Show initial processing message
        jokeElement.textContent = "Processing... Please wait.";

        const article_text = document.querySelector(".text-input").value.trim(); // Trim to avoid empty spaces

        if (!article_text) { 
            jokeElement.textContent = "Please enter some text!";
            loader.style.display = 'none';
            return; // Stop execution if input is empty
        }

        const formdata = new FormData();
        formdata.append('news_text',article_text);

        let response = await fetch('http://127.0.0.1:8000/verify_newstext',{
                method: "POST",
                body: formdata
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        console.log("API Response:", data);

        const classification = data.result || "No classification found";

        loader.style.display = 'none';
        
        jokeElement.innerHTML = `<p>${classification}</p>`; // ✅ Correct usage
        

    } catch (err) {
        console.error("Error:", err);
        document.getElementById('extracted-text').textContent = "Error fetching classification!";
    }
});

document.getElementById("extractButtonvideo").addEventListener('click', async () => {
    try {
        const resultElement = document.getElementById('extracted-text3');
        const loader = document.getElementById('loader3');
        loader.style.display = 'inline-block';
        resultElement.textContent = "Processing video... Please wait.";

        const vid_url = document.querySelector(".input-url").value.trim();

        if (!vid_url) {
            resultElement.textContent = "Please input a url!";
            loader.style.display = 'none';
            return;
        }

        const formData = new URLSearchParams();
        formData.append('url', vid_url);
        console.log(formData);

        let response = await fetch('http://127.0.0.1:8002/predict_url', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: formData
        });


        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        let data = await response.json();
        console.log("Deepfake API Response:", data);

        loader.style.display = 'none';

        let result = "";
        const classification = data.result || "No result";
        if(classification === "Manipulated") {
            result = "Deepfake Video";
        }else {
            result = "Authentic Video";
        }

        resultElement.innerHTML = `
            <p>${result}</p>
        `;

    } catch (err) {
        console.error("Error:", err);
        document.getElementById('extracted-text3').textContent = "Error fetching deepfake result!";
    }
});

