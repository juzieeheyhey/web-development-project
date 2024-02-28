import { useRouter } from "next/router";
import { useEffect, useState, FC } from "react";
import { API_URL } from "@/common/constants";
import { useAuth } from "@/contexts/AuthContext";
import { message } from "antd";
import { IEvent } from "@/common/interfaces_zod";
import { IPhoto } from "@/common/interfaces_zod";

import Image from "next/image";



const EventDetail = () => {
  const router = useRouter();
  const event_id = router.query.event_id;
  const [eventDetails, setEventDetails] = useState<IEvent | null>(null);
  const { getAuthState, authState } = useAuth();
  console.log(router.query.event_id);

  const renderEventPhotos = (photos: IPhoto[] | undefined) => {
    if (!photos || photos.length === 0) return null;

    return photos.map((photoObj, index) => (
      <div key={index}>
        <Image
          src={photoObj.photo}
          alt={`Event Photo ${index + 1}`}
          style={{ maxWidth: "100%", height: "auto", marginBottom: "10px" }}
          width={500}
          height={500}
        />
      </div>
    ));
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (event_id) {
          const response = await fetch(`${API_URL}/api/events/${event_id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${getAuthState()?.token}`,
            },
          });
          if (response.ok) {
            const responseJSON = await response.json();
            console.log("==================");
            console.log("responseJSON: ", responseJSON);
            setEventDetails(responseJSON);
            console.log("eventDetails: ", eventDetails);
          } else {
            const errorMessage = await response.text();
            message.error(errorMessage);
          }
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAuthState]);

  return (
    <div
      style={{
        backgroundColor: "#eaf7f0",
        padding: "20px",
        width: "100%",
        height: "100%",
      }}
    >
      {eventDetails ? (
        <div>
          <h1>Event {eventDetails.event_id}</h1>
          <p>Post Time: {eventDetails.post_time}</p>
          <p>Expiration Time: {eventDetails.exp_time}</p>
          <p>Description: {eventDetails.description}</p>
          <p>
            Location: {eventDetails.location?.Address}, Floor{" "}
            {eventDetails.location?.floor}, Room {eventDetails.location?.room}
          </p>
          <p>Additional location notes: {eventDetails.location?.loc_note}</p>
          {/* Add more fields as needed */}
          {/* Display photos */}
          {renderEventPhotos(eventDetails.photos)}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EventDetail;

