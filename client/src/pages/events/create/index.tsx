import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PlusOutlined } from "@ant-design/icons";
import {
  Input,
  Button,
  Form,
  message,
  DatePicker,
  Select,
  InputNumber,
  Modal,
  Upload,
} from "antd";
import type { RcFile } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import Image from "next/image";
import { API_URL } from "@/common/constants";
import { useAuth } from "@/contexts/AuthContext";





const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const Create = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { getAuthState, authState } = useAuth();

  //const canPostEvents = authState?.decodedToken?.canPostEvents;

  useEffect(() => {
    const canPostEvents = authState?.decodedToken?.canPostEvents;
    if (!canPostEvents) {
      router.push("/access-denied");
    }
  });

  // Description input
  const [description, setDescription] = useState("");

  // qty input
  const [qty, setQuantity] = useState<string | null>(null);

  // Expiration time input
  const [exp_time, setExp_time] = useState("");

  // Tags input
  const [tags, setTags] = useState<number[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [tagIdMap, setTagIdMap] = useState<{ [key: string]: number }>({});

  const [Address, setAddress] = useState("");
  const [floor, setFloor] = useState<number | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [loc_note, setloc_note] = useState("");
  const [location, setLocation] = useState({
    Address: "",
    floor: 0,
    room: "",
    loc_note: "",
  });

  const { Option } = Select;

  // Uploading photo feature
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleCancel = () => setPreviewOpen(false);

  // Preview of photo upload
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  // handle upload photos and update them to FileList
  const handleFileChange = async (info: any) => {
    const updatedFileList = await Promise.all(
      info.fileList.map(async (file: UploadFile) => {
        if (file.originFileObj) {
          const fileUrl = await getBase64(file.originFileObj); // Get the file URL in base64
          return {
            uid: file.uid,
            name: file.name,
            status: file.status,
            url: fileUrl, // Use the actual file URL
            // thumbUrl: fileUrl, // For simplicity, use the same URL for thumbUrl
          };
        }
        return file;
      })
    );

    setFileList(updatedFileList); // update FileList
  };

  useEffect(() => {
    // Fetch existing tags
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tags/`, {
          headers: {
            Authorization: `Bearer ${getAuthState()?.token}`,
          },
        });
        if (response.ok) {
          const tagsData = await response.json();
          console.log(tagsData);
          const idMap: { [key: string]: number } = {};
          tagsData.forEach((tag: { tag_id: number; name: string }) => {
            idMap[tag.name] = tag.tag_id;
          });
          setTagIdMap(idMap);
          setExistingTags(tagsData.map((tag: { name: any }) => tag.name));
        } else {
          console.error("Failed to fetch existing tags");
        }
      } catch (error) {
        console.error("Error fetching existing tags", error);
      }
    };

    fetchTags();
  }, [getAuthState]);

  // create Events
  const createEvent = async () => {
    const values = {
      description,
      qty,
      exp_time,
      tags,
      photos: fileList,
      location: {
        Address,
        floor,
        room,
        loc_note,
      },
    };

    try {
      console.log("Frontend values: ", values);
      const response = await fetch(`${API_URL}/api/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthState()?.token}`,
        },
        body: JSON.stringify({
          description,
          qty,
          exp_time,
          tags,
          location: {
            Address,
            floor,
            room,
            loc_note,
          },
          photos: fileList.map((file) => file.url || ""),
        }),
      });

      console.log("Fetch Response:", response);

      if (response.ok) {
        const responseJSON = await response.json();
        console.log(responseJSON);
        router.push("/events");
      } else {
        const errorMessage = await response.text(); // Get the error message from the response
        message.error(errorMessage);
        console.log(errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // upload Button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8, textAlign: "center" }}> Upload</div>
    </div>
  );

  return (
    <div
      className="CenteredCard"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#eaf7f0",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "450px",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "white",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form form={form} name="Create">
          <h1>Create Event</h1>
          <Form.Item name="description" style={{ textAlign: "left" }}>
            {"Description: "}
            <Input
              placeholder="description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="qty" style={{ textAlign: "left" }}>
            {"Quantity: "}
            <InputNumber
              placeholder="quantity"
              onChange={(value) => setQuantity(value?.toString() || null)}
              min={0}
            />
          </Form.Item>

          <Form.Item name="exp_time" style={{ textAlign: "left" }}>
            {"Expiration Time: "}

            <DatePicker
              showTime
              format="YYYY-MM-DDTHH:mm:ssZ"
              onChange={(date) => {
                const iso8601ExpTime = date
                  ? date.format("YYYY-MM-DDTHH:mm:ssZ")
                  : "";

                setExp_time(iso8601ExpTime);
              }}
            />
          </Form.Item>

          <Form.Item name="tags" style={{ textAlign: "left" }}>
            {"Tags: "}
            <Select
              mode="tags"
              placeholder="Select"
              onChange={(selectedTags) =>
                setTags(
                  selectedTags.map(
                    (tagName: string | number) => tagIdMap[tagName]
                  )
                )
              }
            >
              {existingTags.map((tag) => (
                // eslint-disable-next-line react/jsx-no-undef
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="photos" style={{ textAlign: "left" }}>
            {"Photos: "}
            <Upload
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              listType="picture-circle"
              onPreview={handlePreview}
              onChange={handleFileChange}
              maxCount={10}
            >
              {fileList.length > 10 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={handleCancel}
            >
              <Image
                alt="preview-image"
                src={previewImage}
                width={100}
                height={100}
              />
            </Modal>
          </Form.Item>

          <Form.Item name="location" style={{ textAlign: "left" }}>
            {"Location: "}
            <Input
              placeholder="Address"
              onChange={(e) => setAddress(e.target.value)}
            />

            <InputNumber
              placeholder="Floor"
              onChange={(value) => setFloor(value || 0)}
              min={0}
            />
            <Input
              placeholder="Room"
              onChange={(e) => setRoom(e.target.value)}
            />
            <Input
              placeholder="Location Notes"
              onChange={(e) => {
                setloc_note(e.target.value);
                setLocation({
                  Address: location.Address,
                  floor: location.floor,
                  room: location.room,
                  loc_note: e.target.value,
                });
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              size="large"
              htmlType="submit"
              style={{
                backgroundColor: "MediumSeaGreen",
                border: "none",
                color: "white",
                width: "250px",
              }}
              onClick={createEvent}
            >
              {" "}
              Create Event
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Create;
