import click
from pathlib import Path
import torchaudio
from tqdm import tqdm
import matplotlib.pyplot as plt
import os

from dataset import AudioDataset


@click.command()
@click.option('-p', '--path', help='path to wav audio files')
@click.option('-o', '--out', help='path where to save spektrograms')
@click.option('-sr', '--sample_rate')
@click.option('--n_fft', default=512)
@click.option('--n_mels', default=64)
def main(path, out, sample_rate, n_fft, n_mels):
    Path(out).mkdir(exist_ok=True, parents=True)

    transformer = torchaudio.transforms.MelSpectrogram(
        sample_rate=int(sample_rate),
        n_fft=int(n_fft),
        n_mels=int(n_mels),
    )

    dataset = AudioDataset(path, transformer)

    for i, data in enumerate(tqdm(dataset)):
        mel, filename = data

        out_path = os.path.join(out, f"{filename}.png")

        plt.imsave(out_path, mel[0].numpy(), cmap='gray')
        plt.clf()


if __name__ == '__main__':
    main()
