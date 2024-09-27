import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { DOMParser } from 'xmldom';

dotenv.config();
const geminiAPIKey = process.env.GEMINIAPIKEY;
async function generateFromGemini(explanation) {
    const genAI = new GoogleGenerativeAI(geminiAPIKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        tools: [
            {
                codeExecution: {},
            },
        ],
    });

    const result = await model.generateContent(
        `Generate an svg and only give the svg code on the following explanation don't ask any questions just generate the svg  ${explanation} 
        Just generate the svg whatever you think is fine and also always generate the paths keep the icon very simple using only paths and circles`
    );

    const response =await result.response.text();
    console.log(response)
    return response;
}
async function generateSvg(req, res) {
    try {
        console.log(req.body);
        const { explanation } = req.body;
        const svgText = await generateFromGemini(explanation);
        const svgCode = extractSvgContent(svgText);
        const svgData= convertSvgCodeToJson(svgCode);
        if(svgData){
            return res.status(200).json({svgData});
        }
        return res.status(500).json({error:'Internal Server Error'});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
function extractSvgContent(inputString) {
    // Use a regular expression to match everything between <svg> and </svg>
    const svgContent = inputString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    
    if (svgContent && svgContent[0]) {
        return svgContent[0]; // Return the full <svg> element with its content
    } else {
        return 'No SVG content found';
    }
}

const convertSvgCodeToJson = (svgCode) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgCode, "image/svg+xml");
  const svgElement = svgDoc.documentElement;

  const data = {
    viewBox: svgElement.getAttribute("viewBox") || "0 0 24 24",
    path: Array.from(svgElement.getElementsByTagName("path")).map(path => path.getAttribute("d")),
    circles: Array.from(svgElement.getElementsByTagName("circle")).map(circle => ({
      cx: circle.getAttribute("cx"),
      cy: circle.getAttribute("cy"),
      r: circle.getAttribute("r"),
    })),
    // rects: Array.from(svgElement.getElementsByTagName("rect")).map(rect => ({
    //   x: rect.getAttribute("x"),
    //   y: rect.getAttribute("y"),
    //   width: rect.getAttribute("width"),
    //   height: rect.getAttribute("height"),
    // })),
    // lines: Array.from(svgElement.getElementsByTagName("line")).map(line => ({
    //   x1: line.getAttribute("x1"),
    //   y1: line.getAttribute("y1"),
    //   x2: line.getAttribute("x2"),
    //   y2: line.getAttribute("y2"),
    // })),
    // ellipses: Array.from(svgElement.getElementsByTagName("ellipse")).map(ellipse => ({
    //   cx: ellipse.getAttribute("cx"),
    //   cy: ellipse.getAttribute("cy"),
    //   rx: ellipse.getAttribute("rx"),
    //   ry: ellipse.getAttribute("ry"),
    // })),
    // polygons: Array.from(svgElement.getElementsByTagName("polygon")).map(polygon => ({
    //   points: polygon.getAttribute("points"),
    // })),
    // polylines: Array.from(svgElement.getElementsByTagName("polyline")).map(polyline => ({
    //   points: polyline.getAttribute("points"),
    // })),
    // These are kept for future improvements
  };
  return data;
};

export default generateSvg;