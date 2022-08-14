import { v4 as uuid } from 'uuid'
import BetterRandom from './BetterRandom.js'
import BST from './BST.js'

// function getRndInteger(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min
// }

let c = 0
let bstArray = {}
for (var i = 65; i < 91; ++i) {
  // bstArray[String.fromCharCode(91 - ++c) + uuid().slice(0, 8)] = String.fromCharCode(i)

  const getRandom = () => {
    while (true) {
      const random = BetterRandom(10000, 65535, 10000)
      if (!bstArray[random]) {
        return random
      }
    }
  }

  bstArray[getRandom()] = String.fromCharCode(i)
}

let bst = new BST()
const createBST = () => {
  for (let node in bstArray) {
    bst.insertNode(node, bstArray[node])
  }

  // bst.insert(String.fromCharCode(97) + uuid().slice(0, 8), 'nodeVal')
  // bst.insert(String.fromCharCode(98) + uuid().slice(0, 8), 'nodeVal')
  // bst.insert(String.fromCharCode(99) + uuid().slice(0, 8), 'nodeVal')
  // bst.insert(String.fromCharCode(100) + uuid().slice(0, 8), 'nodeVal')
  // bst.insert(String.fromCharCode(101) + uuid().slice(0, 8), 'nodeVal')
}

createBST()

// bst.printInOrder()
// console.log('----------------------------')
// bst.printPreOrder()
// console.log('----------------------------')
// bst.printPostOrder()

// {type = 'array', order = 'inOrder', unique = false}
// console.log(
//   bst.getBST({
//     type: 'object-kv', //try array or object-vk
//     unique: false,
//   })
// )

console.log([bst.root])
// v

// bst.printPostOrder()
bst.printBST.inOrder()
console.log('----------------------------')
// bst.swapKeyVal()                                            // swap key and value
bst.invertBST()
bst.printBST.inOrder()
