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
    if (!node) {
      return null
    }

    this.invertBST(node.left)
    this.invertBST(node.right)

    if (node.left) {
      if (node.right) {
        const temp = node.left
        node.left = node.right
        node.right = temp
      }
    }

    return this.root
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
    console.log(type, unique, order)
    try {
      if (!['array', 'object-kv', 'object-vk'].includes(type)) {
        throw new Error('Type must be one of: array, object-kv, object-vk.')
      }

      if (!['inOrder', 'preOrder', 'postOrder'].includes(order)) {
        throw new Error('Order must be one of: inOrder, preOrder, postOrder.')
      }

      if (unique) {
        if (type === 'array') throw new Error('Unique is ignored if type is array.')

        if (!this.checkKVUnique(type.slice(7))) {
          throw new Error('Keys/Values must be unique.')
        }
      }

      const result = {
        object: type === 'array' ? [] : {},
        array: (k, v) => result.object.push([k, v]),
        'object-kv': (k, v) => {
          if (result.object[k] && !Array.isArray(result.object[k])) {
            result.object[k] = [result.object[k], v]
          } else if (result.object[k] && Array.isArray(result.object[k])) {
            result.object[k].push(v)
          } else {
            result.object[k] = v
          }
        },
        'object-vk': (k, v) => {
          if (result.object[v] && !Array.isArray(result.object[v])) {
            result.object[v] = [result.object[v], k]
          } else if (result.object[v] && Array.isArray(result.object[v])) {
            result.object[v].push(k)
          } else {
            result.object[v] = k
          }
        },
      }

      const traverse = {
        inOrder: node => {
          if (node !== null) {
            traverse[order](node.left)
            result[type](node.key, node.val)
            traverse[order](node.right)
          }
        },
        preOrder: node => {
          if (node !== null) {
            result[type](node.key, node.val)
            traverse[order](node.left)
            traverse[order](node.right)
          }
        },
        postOrder: node => {
          if (node !== null) {
            traverse[order](node.left)
            traverse[order](node.right)
            result[type](node.key, node.val)
          }
        },
      }

      traverse[order](this.root)
      return result.object
    } catch (e) {
      console.log(e)
    }
  }

  // checks if all values are unique
  // - which is a switch for checking keys or values
  checkKVUnique = which => {
    let unique = true

    let test = this.getBST({
      type: `object-${which}`,
    })

    Object.keys(test).map(keyVal => {
      if (!unique) return
      else if (unique && Array.isArray(test[keyVal])) unique = false
    })

    return unique
  }

  printInOrder = () => {
    const traverse = node => {
      if (node !== null) {
        traverse(node.left)
        console.log('k: ', node.key, 'v: ', node.val)
        traverse(node.right)
      }
    }
    traverse(this.root)
  }

  printPreOrder = () => {
    const traverse = node => {
      if (node !== null) {
        console.log('k: ', node.key, 'v: ', node.val)
        traverse(node.left)
        traverse(node.right)
      }
    }
    traverse(this.root)
  }

  printPostOrder = () => {
    const traverse = node => {
      if (node !== null) {
        traverse(node.left)
        traverse(node.right)
        console.log('k: ', node.key, 'v: ', node.val)
      }
    }
    traverse(this.root)
  }

  printBST = {
    inOrder: () => this.printInOrder(),
    preOrder: () => this.printPreOrder(),
    postOrder: () => this.printPostOrder(),
  }
}
