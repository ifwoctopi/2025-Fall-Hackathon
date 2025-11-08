import { supabase } from '../config/supabase';

/**
 * Save a search to Supabase
 */
export const saveSearch = async (userId, query, result, fileUploaded = false) => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .insert([
        {
          user_id: userId,
          query: query.substring(0, 1000), // Limit query length
          result: result.substring(0, 5000), // Limit result length
          file_uploaded: fileUploaded,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving search:', error);
    return { data: null, error };
  }
};

/**
 * Get user's search history
 */
export const getSearchHistory = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching search history:', error);
    return { data: null, error };
  }
};

/**
 * Delete a search from history
 */
export const deleteSearch = async (searchId) => {
  try {
    const { error } = await supabase
      .from('searches')
      .delete()
      .eq('id', searchId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting search:', error);
    return { error };
  }
};

/**
 * Clear all search history for a user
 */
export const clearSearchHistory = async (userId) => {
  try {
    const { error } = await supabase
      .from('searches')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error clearing search history:', error);
    return { error };
  }
};

