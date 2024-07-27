export interface DeleteImage {
  image_id: number;
  image_key: string;
  type: string;
}

export interface FullImage {
  image_id: string;
  image_key: string;
  image_url: string;
  created_at: Date;
}

export interface Image {
  image_id: number;
  image_key: string;
  image_url: string;
}

export interface CreateImage {
  image_key: string;
  image_url: string;
}

export interface CreateMachineryImage {
  machine_id: string;
  image_key: string;
  image_url: string;
}

export interface CreatePartImage {
  part_id: string;
  image_key: string;
  image_url: string;
}

export interface CreateToolImage {
  tool_id: string;
  image_key: string;
  image_url: string;
}

export interface UpdateImage {
  image_id: string;
  image_key: string;
  image_url: string;
}
