let favicon = document.getElementById('favicon')
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  favicon.href = './img/favicon-light.ico'
} else {
  favicon.href = './img/favicon-dark.ico'
}
favicon = undefined

let BST = null
const leftBar = document.getElementById('leftBar-Content')
const visualizer = document.getElementById('visualizer')
const refreshButton = document.getElementById('refresh-button')
const spinnerWrapper = document.getElementById('spinnerWrapper')
spinnerWrapper.style.visibility = 'visible'
spinnerWrapper.addEventListener('click', e => {
  e.preventDefault()
})

const traverse = (callBack, node, order) => {
  if (node !== null) {
    const func = {
      tl: () => traverse(callBack, node.left, order),
      cb: () => callBack(node),
      tr: () => traverse(callBack, node.right, order),
    }

    for (const pointer of order) {
      func[pointer]()
    }
  }
}

const traverseOrder = order => {
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

const reloadBST = async () => {
  let leftBarContentTableArray = []
  let leftBarContentTable = ''
  leftBar.innerHTML = ''
  visualizer.innerHTML = ''
  const res = await fetch('http://localhost:3406/bst')
  BST = await res.json()
  let index = 0

  const createVisualNode = node => {
    node.element.classList.add('node')
    node.element.innerHTML = `<div class="node-content">
      <div class="node-key">${node.key}</div>
      <div class="node-val">${node.val}</div>
    </div>`
    visualizer.appendChild(node.element)
  }

  traverse(
    node => {
      leftBarContentTableArray.push([node.key, node.val])
      node.element = document.createElement('div')
      node.element.id = `node-${++index}`
      createVisualNode(node)
    },
    BST,
    traverseOrder('inOrder')
  )

  leftBarContentTableArray = leftBarContentTableArray.filter(item => {
    return item[0] !== null || item[0] !== undefined
  })

  leftBarContentTable = '<table class="table">'
  leftBarContentTable += '<thead><tr><th></th><th>Key</th><th>Value</th></tr></thead>'
  leftBarContentTable += '<tbody>'
  for (let [index, [key, val]] of leftBarContentTableArray.entries()) {
    leftBarContentTable += `<tr id="${'tBodyTr-' + ++index}" class="tBodyTr"><td>${index}</td><td>${key}</td><td>${val}</td></tr>`
  }
  leftBarContentTable += '</tbody>'
  leftBarContentTable += '</table>'
  leftBar.innerHTML = leftBarContentTable
  leftBarContentTableArray = undefined

  Array.from(document.querySelectorAll('.tBodyTr')).forEach(el => {
    const idSlice = el.id.split('-')[1]
    const node = document.getElementById(`node-${idSlice}`)

    el.addEventListener('mouseenter', e => node.classList.add('tableToNode'))
    el.addEventListener('mouseleave', e => node.classList.remove('tableToNode'))
  })

  Array.from(document.querySelectorAll('.node')).forEach(el => {
    const idSlice = el.id.split('-')[1]
    const node = document.getElementById(`tBodyTr-${idSlice}`)

    el.addEventListener('mouseenter', e => node.classList.add('nodeToTable'))
    el.addEventListener('mouseleave', e => node.classList.remove('nodeToTable'))
  })
}

;(async () => {
  spinnerWrapper.style.visibility = 'visible'
  await reloadBST()
  spinnerWrapper.style.visibility = 'hidden'
})()

refreshButton.addEventListener('click', async () => {
  spinnerWrapper.style.visibility = 'visible'
  await reloadBST()
  spinnerWrapper.style.visibility = 'hidden'
})
