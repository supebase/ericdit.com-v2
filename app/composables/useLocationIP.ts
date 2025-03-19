interface IPResponse {
  ipinfo: {
    text: string;
  };
  ipdata: {
    info1: string;
  };
}

export const useLocationIP = async () => {
  try {
    const data = await $fetch<IPResponse>("https://api.vore.top/api/IPdata", {
      timeout: 5000,
      retry: 2,
    });

    if (!data.ipinfo?.text || !data.ipdata?.info1) {
      return {
        ip: "无",
        location: "地球",
      };
    }

    return {
      ip: data.ipinfo.text,
      location: data.ipdata.info1,
    };
  } finally {
  }
};
