import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "node:crypto";
import { IIntegritySignatureGenerator } from "domain/src/interface/integrity-signature-generator";

@Injectable()
export class Sha256IntegritySignatureAdapter implements IIntegritySignatureGenerator {
  constructor(private readonly configService: ConfigService) {}

  public generate(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const integritySecret = this.configService.get<string>(
      "WOMPI_INTEGRITY_SECRET",
    );
    const concatenated = `${reference}${amountInCents}${currency}${integritySecret}`;

    return createHash("sha256").update(concatenated).digest("hex");
  }
}
