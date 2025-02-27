import { KeyPairNodeProps } from "./nodes/cryptography/KeyPair";

export class Utf8DataTransfer {
    // Encode a string
    static encodeString(value: string): string {
        return `S${value}`; // Prefix with "S" for string
    }

    // Decode a string
    static decodeString(encoded: string): string {
        return encoded.slice(1); // Remove the "S" prefix
    }

    // Encode a number
    static encodeNumber(value: number): string {
        return `N${value}`; // Prefix with "N" for number
    }

    // Decode a number
    static decodeNumber(encoded: string): number {
        const numberString = encoded.slice(1); // Remove the "N" prefix
        const number = Number(numberString);
        if (isNaN(number)) {
            throw new Error("Invalid number format");
        }
        return number;
    }

    // Encode a byte array
    static encodeByteArray(value: Uint8Array): string {
        const base64 = btoa(String.fromCharCode(...value)); // Convert to Base64
        return `B${base64}`; // Prefix with "B" for byte array
    }

    // Decode a byte array
    static decodeByteArray(encoded: string): Uint8Array {
        const base64 = encoded.slice(1); // Remove the "B" prefix
        const binaryString = atob(base64); // Decode Base64
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    }

    // Generic unpack function
    static unpack(encoded: string): string | number | Uint8Array {
        const prefix = encoded[0]; // Read the first character as the type prefix
        switch (prefix) {
            case "S":
                return Utf8DataTransfer.decodeString(encoded);
            case "N":
                return Utf8DataTransfer.decodeNumber(encoded);
            case "B":
                return Utf8DataTransfer.decodeByteArray(encoded);
            default:
                return "";
        }
    }

    static decodeStringFromMaybeKeyPairNode(nodeData: KeyPairNodeProps | undefined, sourceHandle: string): string {
        if (nodeData?.type === "keypair") {
            return Utf8DataTransfer.readStringFromKeyPairNode(nodeData as KeyPairNodeProps, sourceHandle);
        } else {
            return nodeData ? Utf8DataTransfer.decodeString(nodeData?.data.out as string) : "";
        }
    }

    static readStringFromKeyPairNode(nodeData: KeyPairNodeProps, sourceHandle: string): string {
        if (sourceHandle === "publicKey") {
            return nodeData ? Utf8DataTransfer.decodeString((nodeData).data.out?.publicKey as string) : "";
        } else if (sourceHandle === "privateKey") {
            return nodeData ? Utf8DataTransfer.decodeString((nodeData).data.out?.privateKey as string) : "";
        } else if (sourceHandle === "address") {
            return nodeData ? Utf8DataTransfer.decodeString((nodeData).data.out?.address as string) : "";
        }
        return "";
    }

    static tryDecodeString(nodeData: any | undefined, sourceHandle: string | null | undefined): string {
        return Utf8DataTransfer.decodeStringFromMaybeKeyPairNode(nodeData as KeyPairNodeProps, sourceHandle? sourceHandle : "");
    }
}
