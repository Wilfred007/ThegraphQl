import { BigInt } from "@graphprotocol/graph-ts"
import { Dai, Approval, LogNote, Transfer as TransferEvent } from "../generated/Dai/Dai"
import { Token, User, Transfer } from "../generated/schema";


const DAI_ADDRESS= "0x6B175474E89094C44Da98b954EedeAC495271d0F"



function getOrCreateUser(userId: string): User {
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.balance = BigInt.fromI32(0)
  }
  return user;
}


export function handleTransfer(event: TransferEvent): void {
  // Load or create the token entity
  let token = Token.load(DAI_ADDRESS);
  if (token == null) {
    token = new Token(DAI_ADDRESS);
    token.totalSupply = BigInt.fromI32(0);
  }

  let fromUser = getOrCreateUser(event.transaction.from.toHex());
  let toUser = getOrCreateUser(event.params.dst.toHex());

  fromUser.balance = fromUser.balance.minus(event.transaction.value)
  toUser.balance = toUser.balance.plus(event.transaction.value);

  fromUser.save();
  toUser.save();

  let transfer = new Transfer(event.transaction.hash.toHex());
  
  transfer.from = fromUser.id;
  transfer.to = toUser.id;
  transfer.amount = event.transaction.value;
  transfer.token = token.id;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.timestamp = event.block.timestamp
  
  transfer.save();
}