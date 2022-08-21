// added a right/left/root property to the node class
// - denoted as R, L, ROOT
// - this will be handy for higher level processing of the BST
// - easy way for the node itself to know if it is right or left of parent, or root
// - this will be processed by insertNode, deleteNode, and balancing
class node {
  constructor(key, val, parent, rlr, dpt) {
    this.key = key
    this.val = val
    this.parent = parent // key to parent node
    this.rlr = rlr
    this.dpt = dpt // depth of the node
    this.clr = null // red or black - used for RB balancing -- will use boolean once implemented
    this.left = null
    this.right = null
  }
}

class BST {
  constructor() {
    this.root = null
  }

  #insert = (key, val, currNode, dpt) => {
    ++dpt
    if (key > currNode.key) {
      if (currNode.right === null) {
        currNode.right = new node(key, val, currNode.key, 'R', dpt - 1)
      } else {
        this.#insert(key, val, currNode.right, dpt)
      }
    } else if (key < currNode.key) {
      if (currNode.left === null) {
        currNode.left = new node(key, val, currNode.key, 'L', dpt - 1)
      } else {
        this.#insert(key, val, currNode.left, dpt)
      }
    }
  }

  insertNode = (key, val) => {
    if (this.root === null) {
      this.root = new node(key, val, null, 'ROOT', 0)
    } else {
      this.#insert(key, val, this.root, 1)
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
          function pad(d) {
            return d < 10 ? '0' + d.toString() : d.toString()
          }
          console.log(pad(++this.temp), 'k: ', node.key, 'v: ', node.val)
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

  heightBST = node => {
    if (node == null) return 0
    else {
      let lHeight = height(node.left)
      let rHeight = height(node.right)
      if (lHeight > rHeight) return lHeight + 1
      else return rHeight + 1
    }
  }

  breadthTraverse = (callBack, node) => {
    const runCB = (node, level) => {
      if (node == null) return
      if (level == 1) callBack(node)
      else if (level > 1) {
        runCB(node.left, level - 1)
        runCB(node.right, level - 1)
      }
    }

    let h = this.heightBST(node)
    for (let i = 1; i <= h; i++) runCB(node, i)
  }

  traverse = (callBack, node, order) => {
    if (node !== null) {
      const func = {
        tl: () => traverse(callBack, node.left, order),
        cb: () => callBack(node),
        tr: () => traverse(callBack, node.right, order),
        bf: () => breadthTraverse(callBack, node),
      }

      for (const pointer of order) {
        func[pointer]()
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
      case 'breadthFirst':
        return ['bf']
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
