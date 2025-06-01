import Ajv from "ajv";
import * as Yaml from "yaml";

import { ParsingError, ValidationError } from "@/shared/lib/errors";

export class ContentParser {
  private ajv = new Ajv();

  async parse<T>(text: string, schema: object) {
    try {
      const result = await Yaml.parse(text);

      if (this.ajv.validate(schema, result)) {
        return result as T;
      } else {
        throw new ValidationError([...(this.ajv.errors ?? [])]);
      }
    } catch (error) {
      throw new ParsingError(text, "Content parsing fail", error);
    }
  }
}
