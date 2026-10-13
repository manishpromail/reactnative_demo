export interface UserJson {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export class UserModel {
  readonly id: string;
  readonly email: string;
  readonly name: string;

  constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  static fromJson(json: UserJson): UserModel {
    return new UserModel(
      json.id || json._id || '',
      json.email || '',
      json.name || json.user_metadata?.full_name || ''
    );
  }

  toJson(): UserJson {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
    };
  }
}
