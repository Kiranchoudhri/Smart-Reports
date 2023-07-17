import React from "react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Header from "../Header";
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import { GrEdit } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import "./index.css";
import { useHistory } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";

const apiConstants = {
  initial: "INITIAL",
  progress: "INPROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const FileHistory = () => {
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteErrorMsg, setDeleteErrMsg] = useState("");
  const [fileIdData, setFileIdData] = useState(null);
  const [apiStatus, setApiStatus] = useState(apiConstants.initial);
  const history = useHistory();

  const getFiles = async () => {
    setApiStatus(apiConstants.progress);
    const jwtToken = Cookies.get("jwt_token");
    const apiUrl = "http://localhost:4000/reports-history";
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/pdf",
      },
      method: "GET",
    };
    try {
      const response = await fetch(apiUrl, options);
      console.log(response);
      if (response.ok) {
        setApiStatus(apiConstants.success);
      }
      const data = await response.json();
      console.log("data", data);
      setPdfFiles(data);
      const buffers = data.pdfBuffers.map((bufferData) => {
        const unit8Array = new Uint8Array(bufferData.data);
        console.log("unit8", unit8Array);
        const blob = new Blob([unit8Array], { type: "application/pdf" });
        console.log("blob", blob);
        const url = URL.createObjectURL(blob);
        return url;
      });

      console.log("urls", buffers);
      setPdfFiles(buffers);
      setRecordId(data.recordsId);
    } catch (err) {
      setApiStatus(apiConstants.failure);
      console.error("Error fetching PDF list:", err);
    } finally {
      setLoading(false);
    }
  };

  //delete function
  const deleteFile = async (index) => {
    const id = recordId[index];
    const apiUrl = `http://localhost:4000/delete-record/${id}`;
    console.log(apiUrl);
    const jwtToken = Cookies.get("jwt_token");
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "DELETE",
    };
    const response = await fetch(apiUrl, options);
    const data = await response.text();
    if (response.ok) {
      setDeleteError(false);
      alert(data);
      getFiles();
    } else {
      setDeleteError(true);
      setDeleteErrMsg(data);
    }
  };

  //function to get required format of data to update to form
  const convertToFormData = (testData) => {
    const formData = {};
    testData.forEach((data) => {
      formData[data.attribute_name] = data.test_value;
    });
    console.log(formData);
    return formData;
  };

  //update record function
  const updateRecord = async (index) => {
    const id = recordId[index];
    const apiUrl = `http://localhost:4000/test-record/${id}`;
    const jwtToken = Cookies.get("jwt_token");
    console.log(jwtToken);
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: "GET",
    };
    const response = await fetch(apiUrl, options);
    let data;
    if (response.ok) {
      data = await response.json();
      console.log("file details", data);
      const obtainedFormData = convertToFormData(data);
      setFileIdData(obtainedFormData);
      history.replace("/", { obtainedFormData, fileId: id });
    } else {
      data = await response.text();
      console.log(data);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  console.log("state", pdfFiles);
  console.log("ids", recordId);

  const renderLoadingView = () => {
    return (
      <>
        <Header />
        <div className="spinnerContainer">
          <div className="loader-container loaderUser">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#364ed1"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClassName=""
              visible={true}
            />
          </div>
        </div>
      </>
    );
  };

  const renderSuccessView = () => {
    return (
      <div>
        <Header />
        {pdfFiles.length ? (
          <div className="historyWrapper">
            {/* <Header /> */}
            <h1 className="historyTitle">Your Test Report Records</h1>
            <ul className="docContainer">
              {pdfFiles.map((url, index) => (
                <li className="recordCard" key={index}>
                  <div className="thumbnailContainer">
                    <BsFillFileEarmarkPdfFill className="pdfIcon" />
                  </div>
                  <div className="contentContainer">
                    <p className="docName">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Test Report {index + 1}
                      </a>
                    </p>
                    <div className="editContainer">
                      <button
                        type="button"
                        className="iconBtn"
                        onClick={() => updateRecord(index)}
                      >
                        <GrEdit className="editIcon" />
                      </button>
                      <button
                        type="button"
                        className="iconBtn"
                        onClick={() => deleteFile(index)}
                      >
                        <MdDelete className="delIcon" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="noRecordContainer">
            <p className="noRecordMsg">No Records Found</p>
          </div>
        )}
      </div>
    );
  };

  const renderFailureView = () => {
    return (
      <div>
        <Header />
        <div className="failureContainer">
          <img
            src="https://res.cloudinary.com/dcva6xwxy/image/upload/v1672985481/failure_image_jwtxx7.png"
            className="failureViewImage"
            alt="failure view"
          />
          <p className="failureViewMsg">
            Something went wrong. Please try again
          </p>
          <button type="button" className="tryAgainBtn" onClick={getFiles}>
            Try Again
          </button>
        </div>
      </div>
    );
  };

  switch (apiStatus) {
    case apiConstants.progress:
      return renderLoadingView();
    case apiConstants.success:
      return renderSuccessView();
    case apiConstants.failure:
      return renderFailureView();
    default:
      return null;
  }
  // return (
  //   <div className="historyWrapper">
  //     <Header />
  //     {renderLoadingView()}
  //     <h1 className="historyTitle">Your Test Report Records</h1>
  //     <ul className="docContainer">
  //       {pdfFiles.map((url, index) => (
  //         <li className="recordCard" key={index}>
  //           <div className="thumbnailContainer">
  //             <BsFillFileEarmarkPdfFill className="pdfIcon" />
  //           </div>
  //           <div className="contentContainer">
  //             <p className="docName">
  //               <a href={url} target="_blank" rel="noopener noreferrer">
  //                 Test Report {index + 1}
  //               </a>
  //             </p>
  //             <div className="editContainer">
  //               <button
  //                 type="button"
  //                 className="iconBtn"
  //                 onClick={() => updateRecord(index)}
  //               >
  //                 <GrEdit className="editIcon" />
  //               </button>
  //               <button
  //                 type="button"
  //                 className="iconBtn"
  //                 onClick={() => deleteFile(index)}
  //               >
  //                 <MdDelete className="delIcon" />
  //               </button>
  //             </div>
  //           </div>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
};

export default FileHistory;
