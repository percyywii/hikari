import { notifications, playeranimeinfo, userlists, userprofile } from "./anilistqueries";
import { toast } from 'react-toastify';

const GraphQlClient = async (token, query, variables) => {
  try {
    const response = await fetch("https://graphql.anilist.co/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: 'application/json',
        ...(token && { Authorization: "Bearer " + token }),
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn("AniList GraphQL request failed:", error?.message || error);
    return null;
  }
};


export const Usernotifications = async (token, currentPage) => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        query: notifications,
        variables: {
          page: currentPage,
          perPage: 15,
        },
      }),
    });
    if (!response.ok) return { notifications: [] };
    const data = await response.json();
    return data?.data?.Page || { notifications: [] };
  } catch (error) {
    console.error('Error fetching notifications from AniList:', error?.message || error);
    return { notifications: [] };
  }
}



export const getUserLists = async (token, id) => {
  const res = await GraphQlClient(token, userlists, { id });
  return res?.data?.Media?.mediaListEntry || null;
};

export const saveProgress = async (token, id, progress) => {
  const updatelistprogress = `
    mutation($mediaId: Int, $progress: Int, $progressVolumes: Int) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress, progressVolumes: $progressVolumes) {
        id
        mediaId
        progress
        status
      }
    }
  `;
  const variables = {
    mediaId: id,
    progress: progress,
    progressVolumes: 0
  }
  try {
    const res = await GraphQlClient(token, updatelistprogress, variables);
    if (res?.data?.SaveMediaListEntry) {
      toast.success("Episode progress saved successfully");
    }
  } catch (error) {
    console.warn("An error occurred while updating list:", error?.message || error);
    toast.error("An error occurred while updating list");
  }
}

export const UserProfile = async (token, username) => {
  try {
    const res = await GraphQlClient(token, userprofile, { username });
    return res?.data?.MediaListCollection || { user: null, lists: [] };
  } catch (error) {
    console.error('Error fetching user profile:', error?.message || error);
    return { user: null, lists: [] };
  }
}