canvas = document.getElementById('canvas')
ctx = canvas.getContext("2d")

const numInNodes = 2, numOutNodes = 1, times = [], species = {},
  random = (min, max) => Math.random() * (max - min) + min,
  abs = (a) => Math.abs(a),
  ceil = (a) => Math.ceil(a)

var screenx = 0, screeny = 0, hafx = 0, hafy = 0

i = 10
while (i--) {
  let agent = createAgent()
  addSpecies(agent, getGene(agent))
}

function getGene(agent) {
  let gene = []
  let data = agent[1]
  let i = data.length
  while (i--) {
    if (data[i] != null) {
      gene[i] = [data[i][0], data[i][2]]
    }
  }
  return gene
}

function addSpecies(agent, gene) {
  if (species[gene] == null) {
    species[gene] = [agent]
  } else {
    species[gene].push(agent)
  }
}

function mainloop() {
  // update canvas
  windowInfo()
  text(10 - hafx, hafy - 20, `FPS: ${getFps()}`, 20, "black")
  train()
  request = requestAnimationFrame(mainloop)
}

mainloop()

function train() {
  // train each species seperately
  let x = -hafx
  for (agents in species) {
    let currentAgents = species[agents]
    let i = currentAgents.length
    while (i--) {
      let input = [1, 1]
      let goal = 0
      let score = abs(goal - runAgent(input, currentAgents[i]))
      currentAgents[i][0] = score
      text(x, (i - currentAgents.length / 2) * 20, ~~(score * 1000) / 1000, 20, "black")
    }
    species[agents] = evolveSpecies(mergeSort(currentAgents), currentAgents.length)
    x += 60
  }
}

function evolveSpecies(list, length) {
  list.splice(ceil(list.length / 4))
  let i = length - list.length
  if (i > 0) {
    while (i--) {
      let random1 = list[~~(random(0,1) * random(0,1) * list.length)]
      let random2 = list[~~(random(0,1) * random(0,1) * list.length)]
      list.push(mutate(random1, random2))
    }
  }
  return list
}

function mutate(agent1, agent2) {
  // initilize new agent
  let newAgent = [0, []]
  newAgent.push(agent1[2])
  newAgent.push(agent1[3])
  // the only thing we are changing is the weigths and bais so there is no need to change anything else
  // agentTemplate is the "gene" of the agent, everything should match with agent2 other then the values in it
  agentTemplate = agent1[1]
  // for every node in the gene
  let i = agentTemplate.length
  while (i--) {
    // make sure it is not input nodes
    if (agentTemplate[i] != null) {
      // copy over the connections cuz should be the same
      newAgent[1][i] = [agentTemplate[i][0], []]
      // for every weight in the node
      let j = agentTemplate[i][1].length
      while (j--) {
        // pick the values contained in either agent 1 or 2
        let weight
        if (~~random(0, 2) === 1) {
          weight = agentTemplate[i][1][j]
        } else {
          weight = agent2[1][i][1][j]
        }
        // mutate
        weight += random(-1, 1)
        if (random(0, 1) < 0.0001) {
          weight *= random(-100, 0)
        }
        // insert the crossover and mutated weight
        newAgent[1][i][1].push(weight)
      }
      // copy over function cuz should be same
      newAgent[1][i].push(agentTemplate[i][2])
      // crossover inner bais
      let bais
      if (~~random(0, 2) === 1) {
        bais = agentTemplate[i][3]
      } else {
        bais = agent2[1][i][3]
      }
      bais += random(-1, 1)
      if (random(0, 1) < 0.0001) {
        bais *= random(-100, 0)
      }
      newAgent[1][i].push(bais)
      // crossover outer bais
      if (~~random(0, 2) === 1) {
        bais = agentTemplate[i][4]
      } else {
        bais = agent2[1][i][4]
      }
      bais += random(-1, 1)
      if (random(0, 1) < 0.0001) {
        bais *= random(-100, 0)
      }
      newAgent[1][i].push(bais)
    }
  }
  return newAgent
}

function createAgent() {
  let nodes = [], backLinks = [], weights, probWeights = [], allNodes = [], i = numInNodes
  // create list of previous nodes
  while (i--) {
    backLinks.push(i)
  }
  // input nodes don't contain any info
  // for every output node, create a list of weights for the links
  i = numOutNodes
  while (i--) {
    weights = []
    let j = numInNodes
    while (j--) {
      weights.push(random(-5, 5))
    }
    // add the previous links, weights, function #0-1, inner bais, outer bais
    nodes[i + numInNodes] = [backLinks, weights, ~~random(0, 2), random(-5, 5), random(-5, 5)]
  }
  // make probability list for weight mutation
  i = numInNodes
  while (i--) {
    probWeights.push(numInNodes)
  }
  for (i = 0; i < numOutNodes + numInNodes; i++) {
    // add all nodes for bais / function mutation probability list
    allNodes.push(i)
  }
  // return score place holder, nodes((back links), (weights), function, inner bais, outer bais), weight nodes list, all nodes
  return [0, nodes, probWeights, allNodes]
}

function runAgent(inputs, agent) {
  let output = []
  let sums = []
  let nodes = agent[1]
  // sums stores the sum of a node, nodes is the current agent's nodes
  // set the sums of the input nodes to the inputs
  let i = numInNodes
  while (i--) {
    sums[i] = inputs[i]
  }
  // get the sum of very output node
  i = numOutNodes
  while (i--) {
    output.push(sumNode(numInNodes + i, sums, nodes))
  }
  return output
}

function sumNode(node, sums, nodes) {
  if (sums[node] != null) {
    /* if the sums node has a sum, return the sum to prevent calculating
    the same node again*/
    return sums[node]
  } else {
    let sum = nodes[node][3]
    let backLinks = nodes[node][0]
    let weights = nodes[node][1]
    let activation = nodes[node][2]
    let i = backLinks.length
    // initialize the node sum as the bais, backlinks, weights, etc.
    //for every child node, add their sum * connection weight to the current nodes sum
    while (i--) {
      sum += sumNode(backLinks[i], sums, nodes) * weights[i]
    }
    // for the differnt activation functions
    if (activation === 0) {
      sum = sum > 8 ? 1 : sum < -8 ? -1 : sum / 8
    } else {
      sum = sum > 8 ? 1 : sum < -8 ? -1 : sum < 0 ?
        0 - abs(sum) ** (1 / 3) / 2 : sum ** (1 / 3) / 2
    }
    sum += nodes[node][4]
    sums[node] = sum
    return sum
  }
}

//  merge sort, except the items they are comparing are the first item of each agent(their score) in the agent list
function mergeSort(arr) {
  let len = arr.length
  if (len < 2) {
    return arr
  }
  let middle = ~~(len / 2)
  return merge(mergeSort(arr.slice(0, middle)),
    mergeSort(arr.slice(middle)))
}

function merge(left, right) {
  let result = [], i = 0, j = 0
  while (i < left.length && j < right.length) {
    // compare agent scores
    if (left[i][0] < right[j][0]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}

function windowInfo() {
  // update and clear screen dimensions
  if ((window.innerWidth !== screenx) || (window.innerHeight !== screeny)) {
    screenx = window.innerWidth
    screeny = window.innerHeight
    hafx = screenx / 2
    hafy = screeny / 2
    document.getElementById('canvas').width = screenx
    document.getElementById('canvas').height = screeny
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// self explanotory
function text(x, y, t, s, c) {
  ctx.font = `${s}px Sans`
  ctx.fillStyle = c
  ctx.fillText(t, x + hafx, hafy - y)
}

// same here
function getFps() {
  now = performance.now()
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift()
  }
  times.push(now)
  return times.length
}