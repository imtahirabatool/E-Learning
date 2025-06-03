import { styles } from "@/app/styles/style";
import { FC, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { BsLink45Deg, BsPencil } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: any;
  setCourseContentData: (courseContentData: any) => void;
};

const CourseContent: FC<Props> = ({
  active,
  setActive,
  courseContentData,
  setCourseContentData,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean[]>([]);
  const [activeSection, setActiveSection] = useState(1);

  // Initialize collapse state
  useEffect(() => {
    setIsCollapsed(Array(courseContentData.length).fill(false));
  }, [courseContentData]);

  // Helper function for immutable content updates
  const updateContentData = (index: number, updates: any) => {
    setCourseContentData((prev) => {
      return prev.map((item: any, i: number) => {
        if (i === index) {
          return { ...item, ...updates };
        }
        return item;
      });
    });
  };

  // Helper for updating links
  const updateLinkData = (
    contentIndex: number,
    linkIndex: number,
    updates: any
  ) => {
    setCourseContentData((prev) => {
      return prev.map((content: any, i: number) => {
        if (i === contentIndex) {
          const updatedLinks = content.links.map((link: any, j: number) => {
            if (j === linkIndex) {
              return { ...link, ...updates };
            }
            return link;
          });
          return { ...content, links: updatedLinks };
        }
        return content;
      });
    });
  };

  const handleCollapseToggle = (index: number) => {
    setIsCollapsed((prev) => {
      const newCollapsed = [...prev];
      newCollapsed[index] = !newCollapsed[index];
      return newCollapsed;
    });
  };

  const handleRemoveLink = (contentIndex: number, linkIndex: number) => {
    setCourseContentData((prev) => {
      return prev.map((content: any, i: number) => {
        if (i === contentIndex) {
          const updatedLinks = content.links.filter(
            (_: any, j: number) => j !== linkIndex
          );
          return { ...content, links: updatedLinks };
        }
        return content;
      });
    });
  };

  const handleAddLink = (contentIndex: number) => {
    setCourseContentData((prev) => {
      return prev.map((content: any, i: number) => {
        if (i === contentIndex) {
          return {
            ...content,
            links: [...content.links, { title: "", url: "" }],
          };
        }
        return content;
      });
    });
  };

  const newContentHandler = (item: any) => {
    if (
      item.title === "" ||
      item.description === "" ||
      item.videoUrl === "" ||
      item.links[0]?.title === "" ||
      item.links[0]?.url === "" ||
      item.videoLength === ""
    ) {
      toast.error("Please provide all details of the video");
      return;
    }

    const lastSection =
      courseContentData[courseContentData.length - 1]?.videoSection || "";
    const newContent = {
      videoUrl: "",
      title: "",
      description: "",
      videoSection: lastSection,
      videoLength: "",
      links: [{ title: "", url: "" }],
      id: Date.now().toString(),
    };

    setCourseContentData((prev) => [...prev, newContent]);
  };

  const addNewSection = () => {
    const lastItem = courseContentData[courseContentData.length - 1];

    if (
      !lastItem ||
      lastItem.title === "" ||
      lastItem.description === "" ||
      lastItem.videoUrl === "" ||
      lastItem.links[0]?.title === "" ||
      lastItem.links[0]?.url === "" ||
      lastItem.videoLength === ""
    ) {
      toast.error("Please fill all fields in the last section");
      return;
    }

    const newContent = {
      videoUrl: "",
      title: "",
      description: "",
      videoLength: "",
      videoSection: `Untitled Section ${activeSection}`,
      links: [{ title: "", url: "" }],
      id: Date.now().toString(),
    };

    setCourseContentData((prev) => [...prev, newContent]);
    setActiveSection((prev) => prev + 1);
  };

  const prevButton = () => setActive(active - 1);

  const handleOptions = () => {
    const lastItem = courseContentData[courseContentData.length - 1];

    if (
      !lastItem ||
      lastItem.title === "" ||
      lastItem.description === "" ||
      lastItem.videoUrl === "" ||
      lastItem.links[0]?.title === "" ||
      lastItem.links[0]?.url === "" ||
      lastItem.videoLength === ""
    ) {
      toast.error("Please fill all fields in the last section");
      return;
    }

    setActive(active + 1);
  };

  return (
    <div className="w-[80%] m-auto mt-24 p-3">
      <form onSubmit={(e) => e.preventDefault()}>
        {courseContentData?.map((item: any, index: number) => {
          const showSectionInput =
            index === 0 ||
            item.videoSection !== courseContentData[index - 1]?.videoSection;

          return (
            <div
              className={`w-full bg-[#cdc8c817] p-4 ${
                showSectionInput ? "mt-10" : "mb-0"
              }`}
              key={item.id || index}
            >
              {showSectionInput && (
                <>
                  <div className="flex w-full items-center">
                    <input
                      type="text"
                      className={`text-[20px] ${
                        item.videoSection.startsWith("Untitled Section")
                          ? "w-[170px]"
                          : "w-min"
                      } font-Poppins cursor-pointer dark:text-white text-black bg-transparent outline-none`}
                      value={item.videoSection}
                      onChange={(e) =>
                        updateContentData(index, {
                          videoSection: e.target.value,
                        })
                      }
                    />
                    <BsPencil className="cursor-pointer dark:text-white text-black" />
                  </div>
                  <br />
                </>
              )}

              <div className="flex w-full items-center justify-between my-0">
                {isCollapsed[index] && item.title && (
                  <p className="font-Poppins dark:text-white text-black">
                    {index + 1}. {item.title}
                  </p>
                )}
                <div className="flex items-center">
                  <AiOutlineDelete
                    className={`dark:text-white text-[20px] mr-2 text-black ${
                      index > 0 ? "cursor-pointer" : "cursor-no-drop"
                    }`}
                    onClick={() => {
                      if (index > 0) {
                        setCourseContentData((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }
                    }}
                  />
                  <MdOutlineKeyboardArrowDown
                    fontSize="large"
                    className="dark:text-white text-black"
                    style={{
                      transform: isCollapsed[index]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                    onClick={() => handleCollapseToggle(index)}
                  />
                </div>
              </div>

              {!isCollapsed[index] && (
                <>
                  <div className="my-3">
                    <label className={styles.label}>Video Title</label>
                    <input
                      type="text"
                      placeholder="Project Plan..."
                      className={`${styles.input}`}
                      value={item.title}
                      onChange={(e) =>
                        updateContentData(index, { title: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>Video Url</label>
                    <input
                      type="text"
                      placeholder="Video URL"
                      className={`${styles.input}`}
                      value={item.videoUrl}
                      onChange={(e) =>
                        updateContentData(index, { videoUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>
                      Video Length (in minutes)
                    </label>
                    <input
                      type="number"
                      placeholder="20"
                      className={`${styles.input}`}
                      value={item.videoLength}
                      onChange={(e) =>
                        updateContentData(index, {
                          videoLength: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>Video Description</label>
                    <textarea
                      rows={8}
                      cols={30}
                      placeholder="Video Description"
                      className={`${styles.input} !h-min py-2`}
                      value={item.description}
                      onChange={(e) =>
                        updateContentData(index, {
                          description: e.target.value,
                        })
                      }
                    />
                    <br />
                  </div>

                  {item.links.map((link: any, linkIndex: number) => (
                    <div className="mb-3 block" key={linkIndex}>
                      <div className="w-full flex items-center justify-between">
                        <label className={styles.label}>
                          Link {linkIndex + 1}
                        </label>
                        <AiOutlineDelete
                          className={`${
                            linkIndex === 0
                              ? "cursor-no-drop"
                              : "cursor-pointer"
                          } text-black dark:text-white text-[20px]`}
                          onClick={() =>
                            linkIndex === 0
                              ? null
                              : handleRemoveLink(index, linkIndex)
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Source Code... (Link title)"
                        className={`${styles.input}`}
                        value={link.title}
                        onChange={(e) =>
                          updateLinkData(index, linkIndex, {
                            title: e.target.value,
                          })
                        }
                      />
                      <input
                        type="url"
                        placeholder="Source Code Url... (Link URL)"
                        className={`${styles.input} mt-6`}
                        value={link.url}
                        onChange={(e) =>
                          updateLinkData(index, linkIndex, {
                            url: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}

                  <div className="inline-block mb-4">
                    <p
                      className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                      onClick={() => handleAddLink(index)}
                    >
                      <BsLink45Deg className="mr-2" /> Add Link
                    </p>
                  </div>
                </>
              )}

              {index === courseContentData.length - 1 && (
                <div>
                  <p
                    className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                    onClick={() => newContentHandler(item)}
                  >
                    <AiOutlinePlusCircle className="mr-2" /> Add New Content
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <br />
        <div
          className="flex items-center text-[20px] dark:text-white text-black cursor-pointer"
          onClick={addNewSection}
        >
          <AiOutlinePlusCircle className="mr-2" /> Add new Section
        </div>
      </form>

      <div className="w-full flex items-center justify-between mt-8">
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={prevButton}
        >
          Prev
        </div>
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={handleOptions}
        >
          Next
        </div>
      </div>
      <br />
      <br />
      <br />
    </div>
  );
};

export default CourseContent;
