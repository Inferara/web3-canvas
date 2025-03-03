import { keccak256, toUtf8Bytes } from 'ethers';

export function normalizeEthereumAddress(address: string): string {
  // Convert address to lower case and remove the "0x" prefix
  const addressLower = address.toLowerCase().replace('0x', '');

  // Compute the keccak256 hash of the lower-case address bytes
  const hash = keccak256(toUtf8Bytes(addressLower)).replace('0x', '');

  // Build the checksummed address by using the hash to decide character casing
  let checksumAddress = '0x';
  for (let i = 0; i < addressLower.length; i++) {
    // If the i-th nibble of hash (as an integer) is >= 8, convert the corresponding address character to upper case.
    checksumAddress += parseInt(hash[i], 16) >= 8 ? addressLower[i].toUpperCase() : addressLower[i];
  }

  return checksumAddress;
}
