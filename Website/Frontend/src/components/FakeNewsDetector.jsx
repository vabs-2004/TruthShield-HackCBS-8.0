import React, { useState } from "react";
import axios from "axios";
import "./FakeNewsDetector.css";
import DonutChart from "./chart";

export default function FakeNewsDetector() {
  const [imagetext, setImagetext] = useState("");
  const [imagesource, setImagesource] = useState([]);
  const [imagereason, setImagereason] = useState("");
  const [source, setSource] = useState([]);
  const [reason, setReason] = useState("");
  const [article, setArticle] = useState("");
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState([]);
  const [articleResult, setArticleResult] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [articleConfidence, setArticleConfidence] = useState(null);
  const [imageConfidence, setImageConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [article2, setArticle2] = useState("");
  const [article1, setArticle1] = useState("");
  const [article3, setArticle3] = useState("");
  const [article4, setArticle4] = useState("");
  const [articleData,setarticleData] = useState([]);


  //updated new code with groq api integration
  const imageSubmit2 = async (e) => {
    e.preventDefault();
    if (!image) {
      setImageResult("⚠️ Please upload an image before detecting.");
      return;
    }
    setLoading2(true);
    setImageConfidence(null);
    setImagesource([]);
      setImagereason("");
    setImageResult(null);
    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await axios.post("http://127.0.0.1:8000/verify_Imagearticle", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Server Response:", response.data);
      setImageResult(response.data.verification.result === "REAL" ? "✅ Real Image Detected!" : "⚠️ Fake Image Detected!");
      setImagesource(response.data.verification.sources || []);
      setImagereason(response.data.verification.reasoning || "No specific reason provided.");
    } catch (error) {
      console.error("Error sending image:", error.message);
      setImageResult("⚠️ API error. Please check input format.");
      setImageConfidence(null);
    } finally {
      setLoading2(false);
    }
  };


  const sendData2 = async (e) => {
    e.preventDefault();
    if (!article.trim()) {
      setArticleResult("⚠️ Please enter an article before detecting.");
      return;
    }
    const formdata = new FormData();
    formdata.append("news_text", article);
    setLoading(true);
    try {
      setArticleResult(null)
      setSource([])
      setReason(null)
      setArticleConfidence(null)
      const response = await axios.post("http://127.0.0.1:8000/verify_newstext", formdata);  // No withCredentials
      console.log("Server Response:", response.data);
      setArticleResult(response.data.result === "REAL" ? "✅ Real News Detected!" : "⚠️ Fake News Detected!");
      setSource(response.data.sources || []);
      setReason(response.data.reasoning || "No specific reason provided.");
    } catch (error) {
      console.error("Error sending data:", error.response?.data || error.message);
      setArticleResult("⚠️ API error. Please check input format.");
      setArticleConfidence(null);
    } finally {
      setLoading(false);
    }
      
  }

  // Send article for classification
  const sendData = async () => {
    if (!article.trim()) {
      setArticleResult("⚠️ Please enter an article before detecting.");
      return;
    }

    const requestData = {
      article_text: article,
    };
    setLoading(true);
    try {
      setArticleResult(null)
      setArticleConfidence(null)
      const response = await axios.post(
        "http://127.0.0.1:8000/classify_news",
        requestData,
        {
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          withCredentials: true 
        }
      );

      console.log("Server Response:", response.data);

      const result = response.data.External_fact_verification === "Fake News" ? "⚠️ Fake News Detected!" : "✅ Real News Detected!";
      setArticleResult(result);

      let final1 = parseFloat(response.data.final_confidence) * 100;
      setArticleConfidence(final1); // Store it as a number, not a string
      console.log(articleConfidence);

      let localArticle1, localArticle2, color1, color2;

      if (response.data.External_fact_verification === "Fake News") {
        localArticle1 = "Fake News";
        localArticle2 = "Real News";
        color1 = "red";
        color2 = "green";
      } else {
        localArticle1 = "Real News";
        localArticle2 = "Fake News";
        color1 = "green";
        color2 = "red";
      }

      setArticle1(localArticle1);
      setArticle2(localArticle2);

      const articles = [
        { name: localArticle1, value: articleConfidence || 0, color: color1 },
        { name: localArticle2, value: 100 - (articleConfidence || 0), color: color2 }
      ];
      console.log(articles);
      setarticleData(articles);

      // if (response.data.External_fact_verification === "Fake News") {
      //   const localArticle1 = "Fake News";
      //   const localArticle2 = "Real News";
      //   setArticle1(localArticle1);
      //   setArticle2(localArticle2);
      //   console.log("article1"+": "+article1);
      //   console.log("article2"+": "+article2);
      //   const articles = [
      //     { name: article1, value: articleConfidence || 0, color: "red" },
      //     { name: article2, value: 100 - (articleConfidence || 0), color: "green" }
      //   ];
      //   console.log(articles);
      //   setarticleData(articles);

      // } else {
      //   const localArticle1 = "Real News";
      //   const localArticle2 = "Fake News";
      //   setArticle1(localArticle1);
      //   setArticle2(localArticle2);
      //   console.log("article1"+": "+article1);
      //   console.log("article2"+": "+article2);
      //   const articles = [
      //     { name: article1, value: articleConfidence || 0, color: "green" },
      //     { name: article2, value: 100 - (articleConfidence || 0), color: "red" }
      //   ];
      //   setarticleData(articles);
      //   console.log(articles);
      // }
    } catch (error) {
      console.error("Error sending data:", error.response?.data || error.message);
      setArticleResult("⚠️ API error. Please check input format.");
      setArticleConfidence(null);
    } finally {
      setLoading(false);
    }
  };

  // Submit image for analysis
  const imageSubmit = async () => {
    if (!image) {
      setImageResult("⚠️ Please upload an image before detecting.");
      return;
    }
    try {
      setImageConfidence(null);
      setImageResult(null);
      setLoading2(true);
      const formData = new FormData();
      formData.append("file", image);

      let response = await fetch("http://127.0.0.1:8001/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
      }

      let data = await response.json();
      console.log("API Response:", data);

      setImageResult(data.final_decision === "false" ? "✅ Real News Detected!" : "⚠️ Fake News Detected!");
      const sum = (data.average_confidence_scores.bart || 0) +
        (data.average_confidence_scores.roberta || 0) +
        (data.average_confidence_scores.electra || 0);
      const average = sum / 3;
      let final = average * 100;
      setImageConfidence(final); // Store it as a number

      let localArticle1, localArticle2, color1, color2;
      if (data.final_decision === "fake") {
        localArticle1 = "Fake News";
        localArticle2 = "Real News";
        color1 = "red";
        color2 = "green";
      } else {
        localArticle1 = "Real News";
        localArticle2 = "Fake News";
        color1 = "green";
        color2 = "red";
      }

      setArticle3(localArticle1);
      setArticle4(localArticle2);

      const articles = [
        { name: localArticle1, value: imageConfidence || 0, color: color1 },
        { name: localArticle2, value: 100 - (imageConfidence || 0), color: color2 }
      ];
      console.log(articles);
      setImageData(articles);
      // if (data.final_decision === "fake") {
      //   setArticle3("Real News");
      //   setArticle4("Fake News");
      // } else {
      //   setArticle3("Fake News");
      //   setArticle4("Real News");
      // }
    } catch (error) {
      console.error("Error sending image:", error.message);
      setImageResult("⚠️ API error. Please check input format.");
      setImageConfidence(null);
    } finally {
      setLoading2(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setImageResult("🔍 Analyzing Image...");
  };
 
  // const articleData = [
  //   { name: article1, value: articleConfidence || 0, color: "red" },
  //   { name: article2, value: 100 - (articleConfidence || 0), color: "green" }
  // ];
  // const articleData = [
  //   { name: article1, value: articleConfidence || 0, color: "green" },
  //   { name: article2, value: 100 - (articleConfidence || 0), color: "red" }
  // ];

  // const imageData = [
  //   { name: article3, value: imageConfidence || 0, color: "green" },
  //   { name: article4, value: 100 - (imageConfidence || 0), color: "red" }
  // ];
  

  return (
    <div className="container1 dark-theme">
      <header className="header1">
        <h1 className="title1">📰 Fake News Detector</h1>
        <p className="subtitle1">AI-powered detection for text & images</p>
      </header>

      <div className="gallery1">
        {/* ARTICLE DETECTION SECTION */}
        <div className="card1 article-section1">
          <h2>📄 Enter the Text Article</h2>
          <textarea
            placeholder="Paste article here..."
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            className="textarea1"
          />
          {loading ? <div className="single-loader"></div> : <button className="button1" onClick={sendData2}>Detect Fake News</button>}
          {articleResult && <p className="result1">{articleResult}</p>}

          {
            source.length > 0 && (
              <div className="sources1">
                <h3>🔗 Sources:</h3>
                <ul>
                  {source.map((src, index) => (
                    <li key={index}><a href={src} target="_blank" rel="noopener noreferrer">{src}</a></li>
                  ))}
                </ul>
              </div>
            )
          }
                    {reason && (
            <div className="reason1">
              <h3>🧐 Reasoning:</h3>
              <p>{reason}</p>
            </div>
          )}

          {/* Display DonutChart for article confidence */}
          {/* {articleConfidence !== null && (
            <DonutChart text="Article Confidence" data={articleData} />
          )} */}
        </div>

        {/* IMAGE DETECTION SECTION */}
        <div className="card1 image-section1 display1">
          <h2>🖼️ Upload Image for Analysis</h2>
          <input type="file" className="file-input1" onChange={handleImageUpload} />
          {image && <p className="image-name1">📌 {image.name}</p>}
          
          {loading2 ? <div className="single-loader"></div> : <button className="button1" onClick={imageSubmit2}>Detect Fake Image</button>}
          {imageResult && <p className="result1">{imageResult}</p>}

          {
            imagesource.length > 0 && (
              <div className="sources1">
                <h3>🔗 Sources:</h3>
                <ul>
                  {imagesource.map((src, index) => (
                    <li key={index}><a href={src} target="_blank" rel="noopener noreferrer">{src}</a></li>
                  ))}
                </ul>
              </div>
            )
          }

          {imagereason && (
            <div className="reason1">
              <h3>🧐 Reasoning:</h3>
              <p>{imagereason}</p>
            </div>
          )}

          {/* Display DonutChart for image confidence */}
          {/* {imageConfidence !== null && (
            <DonutChart text="Image Confidence" data={imageData} />
          )} */}
        </div>
      </div>
    </div>
  );
}
