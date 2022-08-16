class node {
  constructor(key, val) {
    this.key = key
    this.val = val
    this.left = null
    this.right = null
  }
}

export default class BST {
  constructor() {
    this.root = null
  }

  #insert = (key, val, currNode) => {
    if (key > currNode.key) {
      if (currNode.right === null) {
        currNode.right = new node(key, val)
      } else {
        this.#insert(key, val, currNode.right)
      }
    } else if (key < currNode.key) {
      if (currNode.left === null) {
        currNode.left = new node(key, val)
      } else {
        this.#insert(key, val, currNode.left)
      }
    }
  }

  insertNode = (key, val) => {
    if (this.root === null) {
      this.root = new node(key, val)
    } else {
      this.#insert(key, val, this.root)
    }
  }

  invertBST = (node = this.root) => {
    if (!node) return null

    if (node.left) {
      if (node.right) {
        ;[node.left, node.right] = [node.right, node.left]
      }
    } else if (node.right) {
      ;[node.left, node.right] = [node.right, node.left]
    }

    this.invertBST(node.left)
    this.invertBST(node.right)
  }

  // swap key and val of the node
  swapKeyVal = (node = this.root) => {
    if (!node) return null
    ;[node.key, node.val] = [node.val, node.key]

    this.swapKeyVal(node.left)
    this.swapKeyVal(node.right)
  }

  // returns an object of specified type and order of the BST
  // type: 'array', 'object: key, val', 'object: val, key'
  // - for types: 'object-*', resulting keys will return arrays if resulting values are not unique
  // - expressed as a string, 'array' or 'object-*'
  // - default: 'array'
  // - 'array' returns an array of the BST's key/val pairs in order
  // - 'object-kv' returns an object of the BST's where: key: val
  // - 'object-vk' returns an object of the BST's where: val: key
  //
  // order: 'inOrder', 'preOrder', 'postOrder'
  // - expressed as a string
  // - default: 'inOrder'
  // - traversed in the order specified: 'inOrder', 'preOrder', 'postOrder'
  //
  // unique: boolean
  // - if array, ignored
  // - if object-*, only unique keys will be allowed
  // - default: false
  // - if true, only unique keys will be allowed and throw an error if not unique
  getBST = ({ type, order, unique }) => {
    type = type || 'array'
    order = order || 'inOrder'
    unique = unique || false
    try {
      if (!['array', 'object-kv', 'object-vk'].includes(type)) {
        throw new Error('Type must be one of: array, object-kv, object-vk.')
      }
      const typeSlice = type !== 'array' ? type.slice(7) : 'kv'

      if (!['inOrder', 'preOrder', 'postOrder'].includes(order)) {
        throw new Error('Order must be one of: inOrder, preOrder, postOrder.')
      }

      if (unique) {
        if (type === 'array') throw new Error('Unique is ignored if type is array.')

        if (!this.checkKVUnique(typeSlice)) {
          throw new Error('Keys/Values must be unique.')
        }
      }

      const result = {
        object: type === 'array' ? [] : {},
        array: (k, v) => result.object.push([k, v]),
        [`object-${typeSlice}`]: (k, v) => {
          ;[k, v] = typeSlice === 'vk' ? [v, k] : [k, v]
          if (result.object[k] && !Array.isArray(result.object[k])) {
            result.object[k] = [result.object[k], v]
          } else if (result.object[k] && Array.isArray(result.object[k])) {
            result.object[k].push(v)
          } else {
            result.object[k] = v
          }
        },
      }

      this.traverse(node => result[type](node.key, node.val), this.root, this.traverseOrder(order))

      return result.object
    } catch (e) {
      console.log(e.message)
    }
  }

  // checks if all values are unique
  // - which is a switch for checking keys or values
  checkKVUnique = typeSlice => {
    let unique = true

    const result = {
      object: {},
      [`object-${typeSlice}`]: (k, v) => {
        ;[k, v] = typeSlice === 'vk' ? [v, k] : [k, v]
        if (result.object[k] && !Array.isArray(result.object[k])) {
          throw new Error('Keys/Values must be unique.')
        } else {
          result.object[k] = v
        }
      },
    }

    this.traverse(node => result[`object-${typeSlice}`](node.key, node.val), this.root, this.traverseOrder('inOrder'))

    return unique
  }

  printBST = {
    func: order => {
      this.traverse(
        node => {
          console.log('k: ', node.key, 'v: ', node.val)
        },
        this.root,
        this.traverseOrder(order)
      )
    },
    inOrder: function () {
      this.func('inOrder')
    },
    preOrder: function () {
      this.func('preOrder')
    },
    postOrder: function () {
      this.func('postOrder')
    },
  }

  // traverses the BST in the order specified
  traverse = function (callBack, node, order) {
    if (node !== null) {
      // first this is the function itself
      // second this refers to the BST because of the difference between regular functions and arrow functions
      // same as usage in this.printBST........
      this.tl = () => this.traverse(callBack, node.left, order)
      this.cb = () => callBack(node)
      this.tr = () => this.traverse(callBack, node.right, order)

      for (const pointer of order) {
        this[pointer]()
      }
    }
  }

  traverseOrder = order => {
    switch (order) {
      case 'inOrder':
        return ['tl', 'cb', 'tr']
      case 'preOrder':
        return ['cb', 'tl', 'tr']
      case 'postOrder':
        return ['tl', 'tr', 'cb']
      default:
        return ['tl', 'cb', 'tr']
    }
  }
}

// printInOrder = () => {
//   const traverse = node => {
//     if (node !== null) {
//       traverse(node.left)
//       console.log('k: ', node.key, 'v: ', node.val)
//       traverse(node.right)
//     }
//   }
//   traverse(this.root)
// }

// printPreOrder = () => {
//   const traverse = node => {
//     if (node !== null) {
//       console.log('k: ', node.key, 'v: ', node.val)
//       traverse(node.left)
//       traverse(node.right)
//     }
//   }
//   traverse(this.root)
// }

// printPostOrder = () => {
//   const traverse = node => {
//     if (node !== null) {
//       traverse(node.left)
//       traverse(node.right)
//       console.log('k: ', node.key, 'v: ', node.val)
//     }
//   }
//   traverse(this.root)
// }
