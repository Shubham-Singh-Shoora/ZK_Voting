use poseidon::poseidon::bn254::{hash_1, hash_2};

global MAX_MERKLE_DEPTH: u32 = 6;

/// Verifies a vote and returns public outputs
/// Private inputs: secret, path_elements, path_indices
/// Public outputs: root, proposal_id, nullifier
fn main(
    secret: Field,
    path_elements: [Field; MAX_MERKLE_DEPTH],
    path_indices: [bool; MAX_MERKLE_DEPTH],
    proposal_id: Field,
    root: Field,
) -> pub (Field, Field, Field) {
    // Compute leaf from secret
    let mut current = hash_1([secret]);

    // Verify Merkle proof across fixed depth
    for i in 0..MAX_MERKLE_DEPTH {
        if path_indices[i] {
            current = hash_2([current, path_elements[i]]);
        } else {
            current = hash_2([path_elements[i], current]);
        }
    }

    // Assert the computed root matches the provided public root
    assert(current == root);

    // Compute nullifier = hash(secret, proposal_id) - prevents double voting
    let nullifier = hash_2([secret, proposal_id]);
    
    // Return public outputs: (root, proposal_id, nullifier)
    // These will be publicInputs[0], publicInputs[1], publicInputs[2] in the verifier
    (root, proposal_id, nullifier)
}
